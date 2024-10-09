"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  EllipsisVertical,
  Eye,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import moment from "moment";

const taskSchema = z.object({
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  status: z.enum(["Todo", "Progress", "Done"]), // Add status field
  priority: z.enum(["Minor", "Low", "Moderate", "Important", "Critical"]),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface Task {
  id: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [priorityCounts, setPriorityCounts] = useState<Record<string, number>>(
    {}
  );
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [priorityStatusCounts, setPriorityStatusCounts] = useState<
    Record<string, Record<string, number>>
  >({});

  const priorityOptions = ["Minor", "Low", "Moderate", "Important", "Critical"];
  const statusOptions = ["Todo", "Progress", "Done"];

  const isFiltering = searchQuery !== "" || filtersApplied;

  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: "",
      status: "Todo", // Default status
      priority: "Low",
      dueDate: new Date(),
    },
  });

  const fetchTasks = async (page = 1) => {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: "5",
        search: searchQuery,
        ...(priorityFilter.length > 0 && {
          priority: priorityFilter.join(","),
        }),
        ...(statusFilter.length > 0 && {
          status: statusFilter.join(","),
        }),
      });

      const response = await fetch(`/api/tasks?${searchParams.toString()}`);

      const data = await response.json();
      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalCount(data.totalCount);
      setPriorityCounts(data.priorityCounts);
      setStatusCounts(data.statusCounts);
      setTotalTaskCount(data.totalTasks);
      setPriorityStatusCounts(data.priorityStatusCounts);
      console.log("LOADING TASKS: ", data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAddDialogOpen) {
      form.reset({ description: "", status: "Todo", priority: "Low" });
    }

    fetchTasks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    isAddDialogOpen,
    isEditDialogOpen,
    priorityFilter,
    statusFilter,
  ]);

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setFiltersApplied(true);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    setFiltersApplied(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter([]);
    setStatusFilter([]);
    setFiltersApplied(false);
  };

  async function onSubmit(values: TaskFormValues) {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      console.log(values);
      if (response.ok) {
        toast({ title: "Success", description: "Task added successfully" });
        setIsAddDialogOpen(false);
        form.reset();

        fetchTasks(1);
      } else {
        throw new Error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    }
  }

  const handleStatusChange = async (taskId: string, isDone: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isDone ? "Done" : "Todo" }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Task status updated successfully",
        });
        fetchTasks(currentPage); // Refresh tasks after update
      } else {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const onEdit = async (values: TaskFormValues) => {
    if (!editingTask) return;
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        form.reset();
        toast({ title: "Success", description: "Task updated successfully" });
        setIsEditDialogOpen(false);
        setEditingTask(null);
        fetchTasks(currentPage);
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const onDelete = async (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Success", description: "Task deleted successfully" });
        fetchTasks(currentPage);
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleEditClick = (task: Task) => {
    console.log(task);
    form.reset({
      description: task.description,
      status: task.status as "Todo" | "Progress" | "Done",
      priority: task.priority as
        | "Minor"
        | "Low"
        | "Moderate"
        | "Important"
        | "Critical",
    });
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
    form.reset();
  };

  const colorMappings: { [key: string]: string } = {
    Minor: "#808080",
    Low: "#00FF00",
    Moderate: "#FFFF00",
    Important: "#FFA500",
    Critical: "#FF0000",
  };

  return (
    <div className="relative">
      <div className="absolute top-2 left-2 lg:top-4 lg:left-4">
        <Image
          className="dark:invert w-32 h-6"
          src="/logo/next.svg"
          alt="Next.js logo"
          width={100}
          height={18}
          priority
        />
      </div>

      <div className="container mx-auto py-14 px-2">
        <h1 className="text-xl font-bold mb-2 tracking-widest">Tasks</h1>

        <div className="flex flex-col gap-4 mb-4">
          {/* Total Task Count Card */}
          <div className="bg-black text-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Total Tasks</h2>
            <p className="text-3xl font-bold">{totalTaskCount}</p>
          </div>

          {/* Priority and Status Breakdown Card */}
          <div className="bg-black text-white shadow rounded-lg p-4 ">
            <h2 className="text-lg font-semibold mb-2">
              Tasks by Priority and Status
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {priorityOptions.map((priority) => (
                <div key={priority} className="flex flex-col">
                  <div className="font-medium flex items-center gap-2">
                    <div
                      className="mr-2 h-1 w-3 rounded"
                      style={{ backgroundColor: colorMappings[priority] }}
                    />
                    <span style={{ color: colorMappings[priority] }}>
                      {priority} {priorityCounts[priority] || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {statusOptions.map((status) => (
                      <div key={`${priority}-${status}`}>
                        {status}:{" "}
                        {priorityStatusCounts[priority]?.[status] || 0}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative lg:w-96">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start">
                  {priorityFilter.length > 0
                    ? `${priorityFilter.length} selected`
                    : "Filter by Priority"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {priorityOptions.map((priority) => (
                  <DropdownMenuCheckboxItem
                    key={priority}
                    checked={priorityFilter.includes(priority)}
                    onCheckedChange={() => handlePriorityFilter(priority)}
                  >
                    <span className="mr-4">
                      {priorityCounts[priority] || 0}
                    </span>
                    {priority}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start">
                  {statusFilter.length > 0
                    ? `${statusFilter.length} selected`
                    : "Filter by status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => handleStatusFilter(status)}
                  >
                    <span className="mr-4">{statusCounts[status] || 0}</span>
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isFiltering && (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={resetFilters}
                  className="ml-2"
                >
                  Reset
                </Button>
                <h1 className="text-sm font-semibold tracking-wider">
                  Results: {totalCount}
                </h1>
              </div>
            )}
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create task here. Click save when you{"'"}re done.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Task description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Todo">Todo</SelectItem>
                              <SelectItem value="Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="bg-black space-y-3 p-2 rounded">
                        <FormLabel className="text-white">
                          Notify me for priority...
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-1"
                          >
                            {[
                              "Minor",
                              "Low",
                              "Moderate",
                              "Important",
                              "Critical",
                            ].map((value, index) => (
                              <FormItem
                                className="flex items-center space-x-3 space-y-0"
                                key={index}
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={value}
                                    id={`priority-${index}`}
                                    style={{
                                      color: colorMappings[value],
                                      borderColor: colorMappings[value],
                                    }}
                                  />
                                </FormControl>
                                <FormLabel
                                  className="font-normal"
                                  style={{ color: colorMappings[value] }}
                                >
                                  {value}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  moment(field.value).format("LLL")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    checked={task.status === "Done"}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.checked)
                    }
                  />
                  <span className="ml-2">{task.description}</span>
                </TableCell>
                <TableCell>{moment(task.dueDate).format("LL")}</TableCell>
                <TableCell>{moment(task.dueDate).fromNow()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="mr-2 h-1 w-3 rounded"
                      style={{ backgroundColor: colorMappings[task.priority] }}
                    />
                    <span>{task.status}</span>
                  </div>
                </TableCell>
                <TableCell className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditClick(task)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href={`/tasks/${task.id}`}
                          className="flex items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(task)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchTasks(page)}
          />
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Make changes to your task here. Click save when you{"'"}re done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEdit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="description"
                  aria-describedby="description-helper-text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todo">Todo</SelectItem>
                            <SelectItem value="Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="bg-black space-y-3 p-2 rounded">
                      <FormLabel className="text-white">
                        Notify me for priority...
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-1"
                        >
                          {[
                            "Minor",
                            "Low",
                            "Moderate",
                            "Important",
                            "Critical",
                          ].map((value, index) => (
                            <FormItem
                              className="flex items-center space-x-3 space-y-0"
                              key={index}
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={value}
                                  id={`priority-${index}`}
                                  style={{
                                    color: colorMappings[value],
                                    borderColor: colorMappings[value],
                                  }}
                                />
                              </FormControl>
                              <FormLabel
                                className="font-normal"
                                style={{ color: colorMappings[value] }}
                              >
                                {value}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                moment(field.value).format("LLL")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this task?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
