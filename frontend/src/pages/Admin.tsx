import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  min-height: 100vh;
  background-color: #1a202c;
  color: white;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;

  @media (max-width: 500px) {
    padding: 15px;
  }
`;

const Section = styled.div`
  background-color: #2d3748;
  padding: 20px;
  margin: 15px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  text-align: center;

  @media (max-width: 500px) {
    padding: 15px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;

  @media (max-width: 500px) {
    font-size: 20px;
  }
`;

const Input = styled.input`
  padding: 10px;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 6px;
  border: none;
  font-size: 16px;

  @media (max-width: 500px) {
    font-size: 14px;
    padding: 8px;
  }
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

  @media (max-width: 500px) {
    font-size: 14px;
    padding: 8px 12px;
  }
`;

const DangerButton = styled(Button)`
  background-color: #8b0000;

  &:hover {
    background-color: #a00000;
  }
`;

const BackButton = styled(Button)`
  margin-top: 30px;
  background-color: #4a5568;

  &:hover {
    background-color: #5a6780;
  }

  @media (max-width: 500px) {
    font-size: 14px;
    padding: 8px 12px;
  }
`;

const CenteredLogin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  width: 100%;
  max-width: 400px;
`;

const Admin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [foodImage, setFoodImage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestList, setGuestList] = useState<string[]>([]);

  const apiUrl = `http://${window.location.hostname}:3001`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/food`);
        setFoodName(res.data.name || "");
        setFoodImage(res.data.image || "");
      } catch (err) {
        console.error("Fehler beim Laden des Gerichts:", err);
      }
    };
    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/guests`);
        setGuestList(res.data || []);
      } catch (err) {
        console.error("Fehler beim Laden der Gäste:", err);
      }
    };

    if (isAuthenticated) {
      fetchGuests();
    }
  }, [isAuthenticated, apiUrl]);

  const checkPassword = () => {
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Falsches Passwort!");
  };

  const saveFoodName = async () => {
    try {
      await axios.post(`${apiUrl}/api/food`, { name: foodName, image: foodImage });
      alert("Gericht gespeichert!");
    } catch {
      alert("Fehler beim Speichern!");
    }
  };

  const saveFoodImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${apiUrl}/api/food-image`, formData);
      setFoodImage(res.data.imageUrl);
      alert("Bild gespeichert!");
    } catch {
      alert("Fehler beim Hochladen!");
    }
  };

  const addGuest = async () => {
    if (guestName.trim() === "") return;
    try {
      await axios.post(`${apiUrl}/api/guests`, { name: guestName });
      setGuestList([...guestList, guestName]);
      setGuestName("");
    } catch {
      alert("Fehler beim Hinzufügen!");
    }
  };

  const resetGuests = async () => {
    try {
      await axios.delete(`${apiUrl}/api/guests`);
      setGuestList([]);
      alert("Gästeliste zurückgesetzt!");
    } catch {
      alert("Fehler beim Zurücksetzen!");
    }
  };

  const resetNames = async () => {
    const pw = prompt("Passwort eingeben:");
    if (pw !== "admin123") return alert("Falsch!");
    try {
      await axios.delete(`${apiUrl}/api/voted-names`);
      alert("Namen zurückgesetzt!");
    } catch {
      alert("Fehler beim Zurücksetzen!");
    }
  };

  const deleteAllData = () => {
    const pw = prompt("Passwort?");
    if (pw === "admin123") {
      localStorage.clear();
      alert("Daten gelöscht!");
    } else alert("Falsch!");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") checkPassword();
  };

  return (
    <Container>
      <Title>Admin-Bereich</Title>

      {!isAuthenticated ? (
        <CenteredLogin>
          <Input
            type="password"
            placeholder="Passwort eingeben"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={checkPassword}>Login</Button>
          <BackButton onClick={() => navigate("/")}>⬅️ Zurück</BackButton>
        </CenteredLogin>
      ) : (
        <>
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

          <Section>
            <Title>Bild hochladen</Title>
            <input type="file" accept="image/*" onChange={saveFoodImage} />
            {foodImage && (
              <img
                src={foodImage}
                alt="Gericht"
                style={{ marginTop: "10px", width: "100%", borderRadius: "8px" }}
              />
            )}
          </Section>

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

          <Section>
            <Title>Verwaltung</Title>
            <Button onClick={resetNames}>🔄 Namen zurücksetzen</Button>
            <Button onClick={resetGuests}>🧑‍🤝‍🧑 Gäste zurücksetzen</Button>
            <DangerButton onClick={deleteAllData}>⚠️ ALLE Daten löschen</DangerButton>
          </Section>

          <Section>
            <Title>Ergebnisse</Title>
            <Button onClick={() => navigate("/results")}>📊 Ergebnisse anzeigen</Button>
          </Section>

          <BackButton onClick={() => navigate("/")}>⬅️ Zurück</BackButton>
        </>
      )}
    </Container>
  );
};

export default Admin;
