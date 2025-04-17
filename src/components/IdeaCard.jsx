function IdeaCard({ idea }) {
    return (
      <div className="bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text p-4 rounded shadow border border-gray-200 dark:border-zinc-700">
        {idea.text}
      </div>
    )
  }
  
  export default IdeaCard