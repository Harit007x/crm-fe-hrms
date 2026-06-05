import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from "date-fns";
import { holidayService, type Holiday } from "@/services/holiday.service";
import { eventService, type EventRecord } from "@/services/event.service";
import { useAuthStore } from "@/store/auth-store";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function HREventsPage() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "" });
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    type: string;
    date: string;
    description?: string;
    color: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const [holidayRecords, eventRecords] = await Promise.all([
        holidayService.getHolidays(),
        eventService.getEvents(),
      ]);
      setHolidays(holidayRecords);
      // Only show events created by this HR user
      const myEvents = eventRecords.filter((ev) => ev.userId === user?.id);
      setEvents(myEvents);
    } catch (error) {
      toast.error("Failed to fetch calendar data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventService.createEvent(newEvent);
      toast.success("Event created successfully");
      setIsDialogOpen(false);
      setNewEvent({ title: "", description: "", date: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const startDay = startDate.getDay();
  const prefixDays = Array.from({ length: startDay }).map((_, i) => i);

  const getEventsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");

    const dayHolidays = holidays
      .filter((h) => format(new Date(h.date), "yyyy-MM-dd") === dateString)
      .map((h) => ({
        id: `hol-${h.id}`,
        title: `🎉 ${h.title}`,
        type: "Holiday",
        date: format(new Date(h.date), "yyyy-MM-dd"),
        description: h.description || "Company Holiday",
        color: "text-rose-400 hover:text-rose-500",
        dot: "bg-rose-400",
      }));

    const dayEvents = events
      .filter((ev) => format(new Date(ev.date), "yyyy-MM-dd") === dateString)
      .map((ev) => ({
        id: `ev-${ev.id}`,
        title: ev.title,
        type: "Event",
        date: format(new Date(ev.date), "yyyy-MM-dd"),
        description: ev.description,
        color: "text-primary hover:text-primary/80",
        dot: "bg-primary",
      }));

    return [...dayHolidays, ...dayEvents];
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-4 md:p-6 bg-background rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Events Calendar</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden shadow-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {prefixDays.map((_, i) => (
          <div key={`empty-${i}`} className="bg-background h-[100px] p-2 opacity-50" />
        ))}

        {daysInMonth.map((date, i) => {
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);

          return (
            <div
              key={i}
              className={`bg-background h-[100px] p-2 border-t border-l border-transparent hover:border-border transition-colors relative ${
                today ? "bg-accent/10" : ""
              }`}
            >
              <div className="flex justify-between items-center shrink-0">
                <span
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    today ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {format(date, "d")}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 top-[36px] px-2 pb-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-0.5">
                  {dayEvents.map((ev: any) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="flex items-center gap-1.5 cursor-pointer truncate"
                      title={ev.title}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.dot}`} />
                      <span className={`text-[11px] font-medium truncate transition-colors ${ev.color}`}>
                        {ev.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              <span>{selectedEvent?.type}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Date</span>
              <span>{selectedEvent?.date}</span>
            </div>
            {selectedEvent?.description && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <span className="whitespace-pre-wrap">{selectedEvent?.description}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
