import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

function MyParty() {
  const [party, setParty] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMovesMode, setEditMovesMode] = useState(null);
  const [selectedMoves, setSelectedMoves] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const playNotification = () => {
    const audio = new Audio("/pokemonSound.wav");
    audio.play();
  };

  const getParty = async () => {
    try {
      const response = await axios.get(
        "https://pokemon-data.adaptable.app/party"
      );
      setParty(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditName = async (pokemonId, newName) => {
    try {
      await axios.patch(
        `https://pokemon-data.adaptable.app/party/${pokemonId}`,
        { name: newName }
      );
      playNotification();
      setParty((prevParty) =>
        prevParty.map((p) => (p.id === pokemonId ? { ...p, name: newName } : p))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditMoves = async (pokemonId, newMoves) => {
    try {
      await axios.patch(
        `https://pokemon-data.adaptable.app/party/${pokemonId}`,
        { selected_moves: newMoves }
      );
      playNotification();
      setParty((prevParty) =>
        prevParty.map((p) =>
          p.id === pokemonId ? { ...p, selected_moves: newMoves } : p
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (pokemonId) => {
    try {
      await axios.delete(
        `https://pokemon-data.adaptable.app/party/${pokemonId}`
      );
      setParty((prevParty) => prevParty.filter((p) => p.id !== pokemonId));
      playNotification();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getParty();
  }, []);

  const handleCheckboxChange = (pokemonId, move, checked) => {
    setSelectedMoves((prev) => {
      const newSelectedMoves = prev[pokemonId] ? [...prev[pokemonId]] : [];

      if (checked) {
        if (newSelectedMoves.length < 4) {
          newSelectedMoves.push(move);
        }
      } else {
        const moveIndex = newSelectedMoves.indexOf(move);
        if (moveIndex > -1) {
          newSelectedMoves.splice(moveIndex, 1);
        }
      }

      return {
        ...prev,
        [pokemonId]: newSelectedMoves,
      };
    });
  };

  const handleSaveMoves = (pokemonId) => {
    if ((selectedMoves[pokemonId] || []).length > 0) {
      setEditMovesMode(null);
      handleEditMoves(pokemonId, selectedMoves[pokemonId] || []);
      setErrorMessage("");
    } else {
      setErrorMessage("Please select at least one move.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ margin: "3% " }}>My Party Page</h1>
      <ul className="list-group" style={{ border: "4px solid #413016" }}>
        {party.length ? (
          party.map((pokemon, index) => (
            <li key={pokemon.id} className="list-group-item rounded">
              <div
                className="pokemon-entry"
                style={{ border: "2px solid #413016" }}
              >
                <div className="d-flex align-items-center">
                  <h1>{index + 1}</h1>
                  <img
                    className="party-ball"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/1200px-Pok%C3%A9_Ball_icon.svg.png"
                  />
                </div>
                <div className="pokemon-info">
                  {editMode === pokemon.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="pokemon-name-input"
                      style={{ marginTop: "10px" }}
                    />
                  ) : (
                    <h3 className="pokemon-name" style={{ marginTop: "10px" }}>
                      {pokemon.name}
                    </h3>
                  )}
                  <img
                    src={pokemon.official_artwork}
                    alt={pokemon.name}
                    className="pokemon-image"
                  />
                </div>
                <ul className="move-list">
                  <h3>Moves</h3>
                  {editMovesMode === pokemon.id ? (
                    <div>
                      {pokemon.learnable_moves.map((move, index) => (
                        <div key={index}>
                          <input
                            type="checkbox"
                            checked={
                              selectedMoves[pokemon.id]
                                ? selectedMoves[pokemon.id].includes(move)
                                : pokemon.selected_moves &&
                                  pokemon.selected_moves.includes(move)
                            }
                            onChange={(e) => {
                              handleCheckboxChange(
                                pokemon.id,
                                move,
                                e.target.checked
                              );
                            }}
                            disabled={
                              !selectedMoves[pokemon.id]?.includes(move) &&
                              selectedMoves[pokemon.id]?.length >= 4
                            }
                          />
                          {move}
                        </div>
                      ))}
                    </div>
                  ) : (
                    (
                      pokemon.selected_moves ||
                      pokemon.learnable_moves.slice(0, 4)
                    ).map((move, index) => (
                      <li key={index} className="move">
                        {move}
                      </li>
                    ))
                  )}
                </ul>
                <div className="d-flex flex-column gap-2">
                  {editMode === pokemon.id ? (
                    <button
                      onClick={() => {
                        setEditMode(null);
                        handleEditName(pokemon.id, editName);
                      }}
                    >
                      Save Name
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditMode(pokemon.id);
                        setEditName(pokemon.name);
                      }}
                    >
                      Edit Name
                    </button>
                  )}
                  {editMovesMode === pokemon.id ? (
                    <button onClick={() => handleSaveMoves(pokemon.id)}>
                      Save Moves
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditMovesMode(pokemon.id);
                        setSelectedMoves((prev) => ({
                          ...prev,
                          [pokemon.id]:
                            pokemon.selected_moves ||
                            pokemon.learnable_moves.slice(0, 4),
                        }));
                      }}
                    >
                      Edit Moves
                    </button>
                  )}
                  <button onClick={() => handleDelete(pokemon.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "20vw",
              marginTop: "10px",
            }}
          >
            No Pokémon in party
          </p>
        )}
      </ul>
    </div>
  );
}

export default MyParty;
