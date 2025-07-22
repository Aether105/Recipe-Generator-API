document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('ingredientInput');
  const button = document.getElementById('searchBtn');
  const results = document.getElementById('results');

  button.addEventListener('click', async () => {
    const ingredient = input.value.trim();
    if (!ingredient) {
      results.innerHTML = '<p>Please enter an ingredient.</p>';
      return;
    }

    results.innerHTML = '<p>Loading...</p>';

    try {
      const res = await fetch(`/recipes?ingredients=${ingredient}`);
      const data = await res.json();

      if (!data.length) {
        results.innerHTML = '<p>No recipes found.</p>';
        return;
      }

      results.innerHTML = data.map(meal => `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <h2>${meal.title}</h2>
          <img src="${meal.thumbnail}" width="200" />
          <p><strong>Category:</strong> ${meal.category} (${meal.area})</p>
          <p><strong>Ingredients:</strong></p>
          <ul>${meal.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
          <p>${meal.instructions.slice(0, 250)}...</p>
          <a href="${meal.youtube}" target="_blank">YouTube Video</a>
        </div>
      `).join('');
    } catch (err) {
      results.innerHTML = '<p>Something went wrong.</p>';
      console.error(err);
    }
  });
});
