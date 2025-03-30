import { useState } from "react";
import { Card, Button, List, Input } from "antd";

interface Task {
    id: number;
    title: string;
    completed: boolean;
}

const TaskManager = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
            setNewTask("");
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
    };

    return (
        <Card title="Task Manager" style={{ width: 400, margin: "20px auto" }}>
            <Input
                placeholder="Enter a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onPressEnter={addTask}
            />
            <Button type="primary" onClick={addTask} style={{ marginTop: 10 }}>
                Add Task
            </Button>

            <List
                bordered
                style={{ marginTop: 20 }}
                dataSource={tasks}
                renderItem={(task) => (
                    <List.Item>
            <span
                style={{ textDecoration: task.completed ? "line-through" : "none", flex: 1 }}
                onClick={() => toggleTask(task.id)}
            >
              {task.title}
            </span>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default TaskManager;
