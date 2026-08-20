import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { getParticipant } from "../services/api";

export default function Badge() {

  const { id } = useParams();

  const [person, setPerson] = useState(null);

  useEffect(() => {

    async function load() {

      const data = await getParticipant(id);

      if (data.success) {
        setPerson(data);
      }

    }

    load();

  }, [id]);

  if (!person) return <h2>Loading...</h2>;

  return (

    <div
      style={{
        width: "400px",
        margin: "30px auto",
        textAlign: "center",
        border: "2px solid #ddd",
        borderRadius: "12px",
        padding: "20px"
      }}
    >

      <h1>USM Registration</h1>

      <h2>{person.name}</h2>

      <p>{person.organization}</p>

      <QRCodeCanvas
        value={person.id}
        size={220}
      />

      <h3>{person.id}</h3>

      <br/>

      <button onClick={() => window.print()}>
        Print Badge
      </button>

    </div>

  );

}
