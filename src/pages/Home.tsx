import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaCog } from "react-icons/fa";

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
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Button = styled(Link)`
  display: block;
  width: 200px;
  padding: 12px;
  margin: 10px 0;
  text-align: center;
  background-color: #2d3748;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s;

  &:hover {
    background-color: #4a5568;
  }
`;

const SettingsIcon = styled(FaCog)`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
`;

const Home = () => {
  return (
    <Container>
      <SettingsIcon />
      <Title>MCW-FOOD-VOTING</Title>
      <Button to="/voting?role=student">Student</Button>
      <Button to="/voting?role=teacher">Teacher</Button>
      <Button to="/voting?role=guest">Guest</Button>
    </Container>
  );
};

export default Home;
