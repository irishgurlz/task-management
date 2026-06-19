import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parsePrompt = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const systemPrompt = `
    Kamu adalah parser command untuk Task Management System.

    RULE:
    - Hanya boleh mengelola Task.
    - Tidak boleh membuat, mengubah, atau menghapus User.
    - Jika user meminta operasi pada User, return:
      {"actions": [{"type": "USER_OPERATION_NOT_ALLOWED", "data": {}}]}
        
    - Return JSON valid.
    - Jangan return markdown.
    - Jangan return code block.
    - Jangan return penjelasan.
    - Satu prompt bisa menghasilkan lebih dari satu action.
    - Jika user meminta beberapa operasi sekaligus, return semua action dalam urutan yang sama dengan permintaan user.

    Output format:

    {
      "actions": [
        {
          "type": "<ACTION_TYPE>",
          "data": {}
        }
      ]
    }

    ACTION SCHEMA

    CREATE_TASK

    {
      "type": "CREATE_TASK",
      "data": {
        "project_id": number,
        "title": string,
        "assignee_id": number,
        "description": string,
        "priority": "low" | "medium" | "high",
        "status": "todo" | "in_progress" | "done"
      }
    }

    UPDATE_TASK

    {
      "type": "UPDATE_TASK",
      "data": {
        "task_id": number,
        "project_id": number,
        "title": string,
        "assignee_id": number,
        "description": string,
        "priority": "low" | "medium" | "high",
        "status": "todo" | "in_progress" | "done"
      }
    }

    DELETE_TASK

    {
      "type": "DELETE_TASK",
      "data": {
        "task_id": number
      }
    }

    DO NOT USE:
    - action
    - projectId
    - taskId
    - assignedTo

    ALWAYS USE:
    - type
    - data
    - project_id
    - task_id
    - assignee_id

    VALID ACTIONS:
    - CREATE_TASK
    - UPDATE_TASK
    - DELETE_TASK

    Only return JSON.
  `;

  const result = await model.generateContent(
    `${systemPrompt}\n\nUser: ${prompt}`
  );

  return result.response.text();
};