import React, { useMemo } from "react";
import { Canvas, Node, Edge, Port } from "reaflow";

/**
 * props:
 * - tabellone: { rounds: [ { name, matches: [...] } ] }
 * - editable: boolean
 * - onWinnerSelected(matchId, athleteId)
 */
export default function TournamentBracket({ tabellone, editable, onWinnerSelected }) {
  
  const { nodes, edges } = useMemo(() => {

    if (!tabellone?.rounds) return { nodes: [], edges: [] };

    const ns = [];
    const es = [];

    tabellone.rounds.forEach((round, r) => {
      const x = r * 300; // posizione orizzontale per round

      round.matches.forEach((m, i) => {
        const y = i * 150; // verticale

        const label =
          `${m.players[0] ? m.players[0].nome + " " + m.players[0].cognome : "—"}\n` +
          `vs\n` +
          `${m.players[1] ? m.players[1].nome + " " + m.players[1].cognome : "—"}`;

        ns.push({
          id: m.id,
          text: label,
          width: 200,
          height: 80,
          x,
          y,
          data: m,
        });

        // connessioni verso round successivo
        const nextRound = tabellone.rounds[r + 1];
        if (nextRound) {
          nextRound.matches.forEach((nm) => {
            if (nm.from?.includes(m.id)) {
              es.push({
                id: `${m.id}->${nm.id}`,
                from: m.id,
                to: nm.id,
              });
            }
          });
        }
      });
    });

    return { nodes: ns, edges: es };
  }, [tabellone]);
    console.log("NODES:", nodes);
    console.log("EDGES:", edges);
  // Dropdown per selezionare il vincitore
  const WinnerDropdown = ({ match }) => {
    if (!editable) return null;

    const players = match.players.filter(Boolean);

    return (
      <select
        style={{ marginTop: 8, width: "100%" }}
        onChange={(e) => {
          if (e.target.value) {
            onWinnerSelected(match.id, e.target.value);
          }
        }}
        defaultValue=""
      >
        <option value="">Seleziona vincitore</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} {p.cognome}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div style={{ width: "100%", height: "800px", background: "#eee", border: "3px solid red" }}>
      <Canvas
        nodes={nodes}
        edges={edges}
        direction="RIGHT"
        readonly={false}
        maxWidth={2000}
        maxHeight={2000}
        animated={false}
        fit
      >
        {(props) => (
          <>
          <Node
  id="TEST"
  text="Test nodo"
  x={100}
  y={100}
  width={200}
  height={80}
  style={{ background: "yellow", border: "2px solid black" }}
/>



            {props.edges.map((edge) => (
              <Edge
                key={edge.id}
                {...edge}
                style={{ stroke: "#000", strokeWidth: 2 }}
              />
            ))}
          </>
        )}
      </Canvas>
    </div>
  );
}
