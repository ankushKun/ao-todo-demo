import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    arweaveWallet: {
      connect: (foo: string[]) => void;
      disconnect: () => void;
      getActiveAddress: () => void;
    };
  }
}

const todoProcess = "oYwd2kreXH7FfwcNhfozftdukwMCgM-dnZR29ywVDUc";

function App() {
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const ao = connect();

  async function addTask(task: string) {
    if (!task) alert("type in a task");
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
    const m_id = await ao.message({
      process: todoProcess,
      signer: createDataItemSigner(window.arweaveWallet),
      data: task,
      tags: [{ name: "Action", value: "Add-Task" }],
    });
    const res = await ao.result({
      process: todoProcess,
      message: m_id,
    });
    console.log(res);
  }

  async function getTasks() {
    const addr = await window.arweaveWallet.getActiveAddress();
    const res = await ao.dryrun({
      process: todoProcess,
      tags: [
        {
          name: "Action",
          value: "Get-Tasks",
        },
      ],
      data: addr,
    });
    console.log(res);
    const { Messages } = res;
    const tasks = Messages[0].Data;
    const tasksJson = JSON.parse(tasks);
    console.log(tasksJson);
    setTasks(tasksJson);
  }

  useEffect(() => {
    setInterval(() => {
      getTasks();
    }, 2000);
  }, []);

  return (
    <>
      <input placeholder="type in your task" onChange={(e) => setNewTask(e.target.value)} />{" "}
      <button
        onClick={() => {
          addTask(newTask);
        }}
      >
        add task
      </button>
      <button
        onClick={() => {
          getTasks();
        }}
      >
        get tasks
      </button>
      <br />
      {tasks.map((task: string, index: number) => {
        return (
          <div style={{ textAlign: "center" }} key={index}>
            {task}
          </div>
        );
      })}
    </>
  );
}

export default App;
