function IdeaCard({ idea }) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p>{idea.text}</p>
      </div>
    )
  }
  
  export default IdeaCard
  