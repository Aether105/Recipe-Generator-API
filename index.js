const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serves static files from the "public" folder.
app.use(express.static(path.join(__dirname, 'public')));

// Polyfill fetch for Node.js < 18.
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Recipe API route.
app.get('/recipes', async (req, res) => {
  const { ingredients } = req.query;
  if (!ingredients) {
    return res.status(400).json({ error: "Missing 'ingredients' query param" });
  }

  const firstIngredient = ingredients.split(',')[0].trim();
  try {
    const searchURL = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${firstIngredient}`;
    const searchRes = await fetch(searchURL);
    const searchData = await searchRes.json();

    if (!searchData.meals) return res.json([]);

    const meals = await Promise.all(
      searchData.meals.slice(0, 5).map(async (meal) => {
        const detailRes = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
        );
        const detailData = await detailRes.json();
        return detailData.meals[0];
      })
    );

    const formatted = meals.map((meal) => ({
      id: meal.idMeal,
      title: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      thumbnail: meal.strMealThumb,
      youtube: meal.strYoutube,
      instructions: meal.strInstructions,
      ingredients: getIngredients(meal),
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

function getIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      list.push(`${ing} - ${measure}`);
    }
  }
  return list;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
