import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #1a202c;
  color: white;
  position: relative;
  padding: 20px;
`;

const Section = styled.div`
  background-color: #2d3748;
  padding: 20px;
  margin: 15px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 10px;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 6px;
  border: none;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #4a5568;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #5a6780;
  }
`;

const DangerButton = styled(Button)`
  background-color: #8b0000;
  &:hover {
    background-color: #a00000;
  }
`;

const BackButton = styled(Button)`
  position: absolute;
  bottom: 20px;
  left: 20px;
`;

const Admin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [foodName, setFoodName] = useState(localStorage.getItem("foodName") || "");
  const [foodImage, setFoodImage] = useState(localStorage.getItem("foodImage") || "");
  const [guestName, setGuestName] = useState("");
  const [guestList, setGuestList] = useState(JSON.parse(localStorage.getItem("guestList") || "[]"));

  // Passwortprüfung
  const checkPassword = () => {
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Falsches Passwort!");
    }
  };

  // Gericht speichern
  const saveFoodName = () => {
    localStorage.setItem("foodName", foodName);
    alert("Gericht gespeichert!");
  };

  // Bild speichern
  const saveFoodImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFoodImage(imageUrl);
        localStorage.setItem("foodImage", imageUrl);
        alert("Bild gespeichert!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Gast hinzufügen
  const addGuest = () => {
    if (guestName.trim() === "") return;
    const updatedGuests = [...guestList, guestName];
    setGuestList(updatedGuests);
    localStorage.setItem("guestList", JSON.stringify(updatedGuests));
    setGuestName("");
    alert("Gast hinzugefügt!");
  };

  // Gäste zurücksetzen
  const resetGuests = () => {
    setGuestList([]);
    localStorage.setItem("guestList", "[]");
    alert("Gästeliste zurückgesetzt!");
  };

  // Namen resetten
  const resetNames = () => {
    localStorage.removeItem("votedNames");
    alert("Alle Namen zurückgesetzt!");
  };

  // ✅ Abstimmung starten
  const startVoting = () => {
    const confirmPassword = prompt("Passwort eingeben, um die Abstimmung zu starten:");
    if (confirmPassword === "admin123") {
      resetNames(); // Namen zurücksetzen, damit alle wieder voten können
      localStorage.setItem("votingActive", "true");
      alert("Abstimmung gestartet!");
    } else {
      alert("Falsches Passwort!");
    }
  };

  // 🛑 Abstimmung beenden
  const endVoting = () => {
    const confirmPassword = prompt("Passwort eingeben, um die Abstimmung zu beenden:");
    if (confirmPassword === "admin123") {
      localStorage.setItem("votingActive", "false");
      alert("Abstimmung beendet & Ergebnisse gespeichert!");
    } else {
      alert("Falsches Passwort!");
    }
  };

  // ❌ Alle Daten löschen
  const deleteAllData = () => {
    const confirmPassword = prompt("Passwort eingeben, um ALLE Daten zu löschen:");
    if (confirmPassword === "admin123") {
      localStorage.clear();
      alert("Alle gespeicherten Daten wurden gelöscht!");
    } else {
      alert("Falsches Passwort!");
    }
  };

  return (
    <Container>
      <Title>Admin-Bereich</Title>

      {!isAuthenticated ? (
        <>
          <Input
            type="password"
            placeholder="Passwort eingeben"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={checkPassword}>Login</Button>
        </>
      ) : (
        <>
          {/* Abstimmung verwalten */}
          <Section>
            <Title>Abstimmung verwalten</Title>
            <Button onClick={startVoting}>✅ Abstimmung starten</Button>
            <Button onClick={endVoting}>🛑 Abstimmung beenden</Button>
          </Section>

          {/* Gericht setzen */}
          <Section>
            <Title>Gericht ändern</Title>
            <Input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Gericht eingeben..."
            />
            <Button onClick={saveFoodName}>Gericht speichern</Button>
          </Section>

          {/* Bild hochladen */}
          <Section>
            <Title>Bild hochladen</Title>
            <input type="file" accept="image/*" onChange={saveFoodImage} />
            {foodImage && <img src={foodImage} alt="Gericht" style={{ marginTop: "10px", width: "100%" }} />}
          </Section>

          {/* Gäste hinzufügen */}
          <Section>
            <Title>Gast hinzufügen</Title>
            <Input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Gastnamen eingeben..."
            />
            <Button onClick={addGuest}>Gast speichern</Button>
          </Section>

          {/* Reset-Buttons */}
          <Section>
            <Title>Verwaltung</Title>
            <Button onClick={resetNames}>🔄 Namen zurücksetzen</Button>
            <Button onClick={resetGuests}>🧑‍🤝‍🧑 Gäste zurücksetzen</Button>
            <DangerButton onClick={deleteAllData}>⚠️ ALLE Daten löschen</DangerButton>
          </Section>

          {/* Ergebnisse anzeigen */}
          <Section>
            <Title>Ergebnisse</Title>
            <Button onClick={() => navigate("/results")}>📊 Ergebnisse anzeigen</Button>
          </Section>
        </>
      )}

      {/* Zurück */}
      <BackButton onClick={() => navigate("/")}>⬅️ Zurück</BackButton>
    </Container>
  );
};

export default Admin;
