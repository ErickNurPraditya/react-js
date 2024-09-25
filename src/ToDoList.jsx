// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { Button, Form, Container, ListGroup, Row, Col } from 'react-bootstrap';

function TodoList() {
  const [task, setTask] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTask, setEditingTask] = useState("");

  function handleInputChange(event) {
    setNewTask(event.target.value);
  }

  function handleEditChange(event) {
    setEditingTask(event.target.value);
  }

  function addTask() {
    if (newTask.trim() !== "") {
      setTask([...task, newTask]);
      setNewTask("");
    }
  }

  function deleteTask(index) {
    const updatedTasks = task.filter((_, i) => i !== index);
    setTask(updatedTasks);
  }

  function moveTaskUp(index) {
    if (index > 0) {
      const updatedTasks = [...task];
      [updatedTasks[index - 1], updatedTasks[index]] = [updatedTasks[index], updatedTasks[index - 1]];
      setTask(updatedTasks);
    }
  }

  function moveTaskDown(index) {
    if (index < task.length - 1) {
      const updatedTasks = [...task];
      [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
      setTask(updatedTasks);
    }
  }

  function editTask(index) {
    setEditingIndex(index);
    setEditingTask(task[index]);
  }

  function saveTask() {
    const updatedTasks = [...task];
    updatedTasks[editingIndex] = editingTask;
    setTask(updatedTasks);
    setEditingIndex(null);
    setEditingTask("");
  }

  return (
    <Container className="to-do-list">
      <h1>To-Do List</h1>
      <Form className="add-task-form">
        <Form.Control
          type="text"
          placeholder="Enter a task..."
          value={newTask}
          onChange={handleInputChange}
        />
        <Button
          variant="success"
          className="add-button"
          onClick={addTask}
        >
          Add
        </Button>
      </Form>

      <ListGroup as="ol" numbered>
        {task.map((task, index) => (
          <ListGroup.Item
            as="li"
            key={index}
            className="d-flex justify-content-between align-items-center"
          >
            {editingIndex === index ? (
              <Form.Control
                type="text"
                value={editingTask}
                onChange={handleEditChange}
              />
            ) : (
              <span className="text">{task}</span>
            )}
            <div className="task-actions">
              {editingIndex === index ? (
                <Button variant="warning" className="save-button" onClick={saveTask}>
                  Save
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="edit-button"
                    onClick={() => editTask(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="delete-button"
                    onClick={() => deleteTask(index)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="info"
                    className="move-button"
                    onClick={() => moveTaskUp(index)}
                  >
                    👆
                  </Button>
                  <Button
                    variant="info"
                    className="move-button"
                    onClick={() => moveTaskDown(index)}
                  >
                    👇
                  </Button>
                </>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}

export default TodoList;
