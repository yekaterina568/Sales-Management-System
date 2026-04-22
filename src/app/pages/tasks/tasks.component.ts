import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/crm.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentFilter: 'All' | 'Active' | 'Completed' = 'All';

  newTaskTitle: string = '';
  newTaskDeadline: string = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilter();
    });
  }

  setFilter(filter: 'All' | 'Active' | 'Completed'): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.currentFilter) {
      case 'Active':
        this.filteredTasks = this.tasks.filter(t => !t.completed);
        break;
      case 'Completed':
        this.filteredTasks = this.tasks.filter(t => t.completed);
        break;
      default:
        this.filteredTasks = this.tasks;
        break;
    }
  }

  toggleTask(id: string): void {
    this.taskService.toggleTaskStatus(id);
  }

  addTask(): void {
    if (this.newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: this.newTaskTitle,
        deadline: this.newTaskDeadline || new Date().toISOString().split('T')[0],
        completed: false
      };
      this.taskService.addTask(newTask);
      this.newTaskTitle = '';
      this.newTaskDeadline = '';
    }
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id);
  }
}
