import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { fileService, type FileRecord } from "@/services/file.service";



export default function FilesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await fileService.getAllFiles();
      setFiles(data);
    } catch (error) {
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const renderIcon = (type: string) => {
    switch (type) {
      case "folder": return <Icons.folder className="h-10 w-10 text-blue-500 fill-blue-500/20" />;
      case "image": return <Icons.media className="h-10 w-10 text-purple-500" />;
      case "pdf": return <Icons.post className="h-10 w-10 text-red-500" />;
      case "video": return <Icons.page className="h-10 w-10 text-orange-500" />;
      case "document": return <Icons.page className="h-10 w-10 text-blue-400" />;
      default: return <Icons.page className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("filename") as HTMLInputElement).value || "Untitled File";
    
    try {
      await fileService.uploadFile({
        name,
        size: "1.2 MB", // Mocked size since we don't have actual file upload
        type: "document",
        url: "https://example.com/mock-file.pdf"
      });
      toast.success("File uploaded successfully.");
      setIsUploadOpen(false);
      fetchFiles();
    } catch (error) {
      toast.error("Failed to upload file");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fileService.deleteFile(id);
      toast.success("File deleted");
      fetchFiles();
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="flex flex-col space-y-6 h-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Files</h2>
          <p className="text-muted-foreground text-sm">
            Manage your project assets, documents, and media.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-8 bg-background"
            />
          </div>
          
          <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                <Icons.cloudUpload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full">
              <SheetHeader>
                <SheetTitle>Upload File</SheetTitle>
                <SheetDescription>
                  Upload a new document or asset to the current folder.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleUploadSubmit} className="space-y-6 mt-2 px-4 overflow-y-auto pb-4">
                {/* Drag and Drop Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Icons.cloudUpload className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-sm mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG, PDF or DOCX (max. 50MB)</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="filename">File Name (Optional)</Label>
                    <Input id="filename" placeholder="Leave blank to use original name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="e.g. invoice, priority, client" />
                  </div>
                </div>

                <SheetFooter className="mt-8 flex flex-col sm:flex-row gap-3 px-4 pb-4 border-t pt-4">
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                  </SheetClose>
                  <Button type="submit" className="flex-1 bg-blue-600 text-white">Upload File</Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          
          <div className="hidden sm:flex border rounded-md">
            <Button 
              variant={view === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className="rounded-r-none h-9 w-9"
              onClick={() => setView("grid")}
            >
              <Icons.menu className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className="rounded-l-none h-9 w-9"
              onClick={() => setView("list")}
            >
              <Icons.listFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6 m-0">
          


          {/* Files Section */}
          {files.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                All Files
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="group relative hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-32 bg-muted/30 flex items-center justify-center rounded-t-xl border-b">
                        {renderIcon(file.type)}
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-medium truncate text-sm" title={file.name}>
                            {file.name}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Icons.eye className="mr-2 h-4 w-4" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Icons.downloadArrow className="mr-2 h-4 w-4" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Icons.link2 className="mr-2 h-4 w-4" /> Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(file.id)}>
                                <Icons.trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">{file.size}</p>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Icons.folder className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">No files here</h3>
              <p className="text-muted-foreground text-sm">Upload some files to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="m-0">
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
            No recent files found.
          </div>
        </TabsContent>
        <TabsContent value="shared" className="m-0">
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
            No shared files found.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
