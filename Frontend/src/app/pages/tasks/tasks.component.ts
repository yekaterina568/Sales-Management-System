import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tasks.component.html',
    styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
    tasks: any[] = [];
    filteredTasks: any[] = [];
    currentFilter: 'All' | 'Active' | 'Completed' = 'All';
    error: string = '';
    loading: boolean = true;

    newTaskTitle: string = '';
    newTaskDeadline: string = '';

    constructor(private api: ApiService) { }

    ngOnInit(): void {
        this.loadTasks();
    }

    loadTasks(): void {
        this.loading = true;
        this.api.getTasks().subscribe({
            next: (tasks) => {
                this.tasks = tasks;
                this.applyFilter();
                this.loading = false;
            },
            error: () => {
                this.error = 'Failed to load tasks';
                this.loading = false;
            }
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
                this.filteredTasks = [...this.tasks];
        }
    }

    toggleTask(task: any): void {
        this.api.updateTask(task.id, { completed: !task.completed }).subscribe({
            next: (updated) => {
                const index = this.tasks.findIndex(t => t.id === task.id);
                if (index !== -1) {
                    this.tasks[index] = updated;
                    this.applyFilter();
                }
            },
            error: () => { this.error = 'Failed to update task'; }
        });
    }

    addTask(): void {
        if (!this.newTaskTitle.trim() || !this.newTaskDeadline) return;
        this.api.createTask({
            title: this.newTaskTitle,
            deadline: this.newTaskDeadline,
            completed: false
        }).subscribe({
            next: (task) => {
                this.tasks.push(task);
                this.applyFilter();
                this.newTaskTitle = '';
                this.newTaskDeadline = '';
            },
            error: () => { this.error = 'Failed to create task'; }
        });
    }

    deleteTask(id: number): void {
        this.api.deleteTask(id).subscribe({
            next: () => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.applyFilter();
            },
            error: () => { this.error = 'Failed to delete task'; }
        });
    }
}