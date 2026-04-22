import { Injectable } from '@angular/core';
import { Task } from '../models/crm.models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [
    { id: '1', title: 'Follow up with Acme Corp regarding redesign', deadline: '2025-02-25', completed: false },
    { id: '2', title: 'Prepare proposal for TechStart Inc', deadline: '2025-03-01', completed: true },
    { id: '3', title: 'Schedule demo for GlobalTech Inc', deadline: '2025-03-05', completed: false },
    { id: '4', title: 'Review contract for Nova Labs', deadline: '2025-02-28', completed: false },
    { id: '5', title: 'Send invoice to Spark Digital', deadline: '2025-02-20', completed: true },
    { id: '6', title: 'Update pipeline for Q2', deadline: '2025-03-31', completed: false }
  ];

  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(task: Task): void {
    this.tasks.push(task);
    this.tasksSubject.next([...this.tasks]);
  }

  toggleTaskStatus(id: string): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.tasksSubject.next([...this.tasks]);
    }
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.tasksSubject.next([...this.tasks]);
  }
}
