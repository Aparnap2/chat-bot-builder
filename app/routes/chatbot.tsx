// app/routes/chatbot.tsx
import { useState } from "react";
import gql from "graphql-tag";

// Use default import and destructure the named exports from '@apollo/client'
import pkg from '@apollo/client';
const { useQuery, useMutation } = pkg;

const GET_CHATBOTS = gql`
  query GetChatbots {
    chatbots {
      id
      name
      connectionString
      createdAt
    }
  }
`;

const CREATE_CHATBOT = gql`
  mutation CreateChatbot($name: String!) {
    createChatbot(name: $name) {
      id
      name
      connectionString
      createdAt
    }
  }
`;

export default function ChatbotPage() {
  const { loading, error, data, refetch } = useQuery(GET_CHATBOTS);
  const [createChatbot] = useMutation(CREATE_CHATBOT);
  const [name, setName] = useState("");

  if (loading) return <p>Loading chatbots...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleCreate = async () => {
    try {
      await createChatbot({ variables: { name } });
      setName("");
      refetch();
    } catch (err) {
      console.error("Error creating chatbot:", err);
    }
  };

  return (
    <div>
      <h2>Your Chatbots</h2>
      <div>
        <input
          type="text"
          placeholder="Chatbot Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreate}>Create Chatbot</button>
      </div>
      <ul>
        {data.chatbots.map((bot: any) => (
          <li key={bot.id}>
            <strong>{bot.name}</strong> — {bot.connectionString}
          </li>
        ))}
      </ul>
    </div>
  );
}