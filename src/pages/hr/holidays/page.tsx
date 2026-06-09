import { useState, useEffect, useMemo } from "react";
import { holidayService, type Holiday } from "@/services/holiday.service";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-column-header";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import IconWrapper from "@/components/icons-wrapper";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DateRangeFilter } from "@/components/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ActionCell = ({ row, onRefresh }: { row: any, onRefresh: () => void }) => {
  const holiday = row.original as Holiday;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(holiday.title);
  const [date, setDate] = useState(holiday.date.split("T")[0]);
  const [description, setDescription] = useState(holiday.description || "");
  const [type, setType] = useState(holiday.type || "Public");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await holidayService.updateHoliday(holiday.id, { title, date, description, type });
      toast.success("Holiday updated successfully");
      setIsEditOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update holiday");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await holidayService.deleteHoliday(holiday.id);
      toast.success("Holiday deleted successfully");
      setIsDeleteOpen(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete holiday");
    }
  };

  return (
    <div className="w-fit flex gap-1">
      <IconWrapper
        className="cursor-pointer text-blue hover:fill-blueBackground hover:bg-blueBackground"
        onClick={() => {
          setTitle(holiday.title);
          setDate(holiday.date.split("T")[0]);
          setDescription(holiday.description || "");
          setType(holiday.type || "Public");
          setIsEditOpen(true);
        }}
      >
        <Icons.pencil className="h-4 w-4" />
      </IconWrapper>
      <IconWrapper
        className="cursor-pointer text-red hover:fill-redBackground hover:bg-redBackground"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Icons.trash className="h-4 w-4" />
      </IconWrapper>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Holiday</SheetTitle>
            <SheetDescription>Update holiday details below.</SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type">Holiday Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red hover:bg-red/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function HRHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createType, setCreateType] = useState("Public");
  const [createLoading, setCreateLoading] = useState(false);

  const handleResetFilters = () => {
    setSearchName("");
    setTypeFilter("All");
    setDateRange(undefined);
  };

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const data = await holidayService.getHolidays();
      setHolidays(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [refreshTrigger]);

  const handleCreate = async () => {
    if (!createTitle || !createDate) {
      toast.error("Please fill in Title and Date");
      return;
    }
    setCreateLoading(true);
    try {
      await holidayService.createHoliday({ title: createTitle, date: createDate, description: createDesc, type: createType });
      toast.success("Holiday created successfully");
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateDate("");
      setCreateDesc("");
      setCreateType("Public");
      setRefreshTrigger((p) => p + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create holiday");
    } finally {
      setCreateLoading(false);
    }
  };

  // Apply filters
  const filteredHolidays = useMemo(() => {
    return holidays.filter((holiday) => {
      // Upcoming filter (Current month only)
      if (!showAll) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        
        // Must be >= today AND in the current month/year
        if (
          holidayDate < today ||
          holidayDate.getMonth() !== today.getMonth() ||
          holidayDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      }

      // Name filter
      if (searchName && !holiday.title.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      // Type filter
      if (typeFilter !== "All" && holiday.type !== typeFilter) {
        return false;
      }
      // Date filter
      if (dateRange?.from) {
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        if (dateRange.to) {
          const to = new Date(dateRange.to);
          to.setHours(23, 59, 59, 999);
          if (holidayDate < from || holidayDate > to) return false;
        } else {
          if (holidayDate < from) return false;
        }
      }
      return true;
    });
  }, [holidays, dateRange, searchName, typeFilter, showAll]);

  const columns = useMemo<ColumnDef<Holiday>[]>(() => [
    {
      header: "Holiday Name",
      accessorKey: "title",
      cell: ({ row }) => <span className="font-semibold">{row.original.title}</span>,
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => <span>{format(new Date(row.original.date), "MMMM dd, yyyy")}</span>
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => {
        const type = row.original.type || "Public";
        let variant: "default" | "secondary" | "outline" = "default";
        if (type === "Company") variant = "secondary";
        else if (type === "Optional") variant = "outline";
        return <Badge variant={variant}>{type}</Badge>;
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-xs block">{row.original.description || "-"}</span>,
    },
    {
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
      cell: ({ row }) => <ActionCell row={row} onRefresh={() => setRefreshTrigger(p => p + 1)} />,
    }
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Holiday Management</h2>
          <p className="text-muted-foreground">Manage company-wide holidays and days off.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant={showAll ? "secondary" : "outline"} onClick={() => setShowAll(!showAll)}>
            {showAll ? "View Upcoming Only" : "View All Holidays"}
          </Button>
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} align="end" />
          <Button onClick={() => setIsCreateOpen(true)}>
            <Icons.plus className="h-4 w-4 mr-2" /> Add Holiday
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-4">
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Search Holiday Name</label>
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block">Holiday Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="Optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredHolidays}
            gridCount={filteredHolidays.length}
          />
        )}
      </div>

      {/* Create Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Holiday</SheetTitle>
            <SheetDescription>Add a new company holiday to the calendar.</SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="create-title">Holiday Name</Label>
              <Input id="create-title" placeholder="e.g. New Year's Day" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="create-date">Date</Label>
              <Input id="create-date" type="date" value={createDate} onChange={(e) => setCreateDate(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea id="create-desc" placeholder="Optional details" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="create-type">Holiday Type</Label>
              <Select value={createType} onValueChange={setCreateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading ? "Saving..." : "Save Holiday"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
