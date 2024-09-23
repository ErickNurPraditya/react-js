// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Navbar, Nav, Spinner } from 'react-bootstrap';

const App = () => {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [drinkCategories, setDrinkCategories] = useState([]);
  const [drinkRecipes, setDrinkRecipes] = useState({});
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryView, setIsCategoryView] = useState(true);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    try {
      const mealCategoriesResponse = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
      const drinkCategoriesResponse = await fetch('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list');
      const mealCategoriesData = await mealCategoriesResponse.json();
      const drinkCategoriesData = await drinkCategoriesResponse.json();

      setCategories(mealCategoriesData.categories);
      setDrinkCategories(drinkCategoriesData.drinks);

      const mealPromises = mealCategoriesData.categories.map((category) => fetchRecipesByCategory(category.strCategory));
      const drinkPromises = drinkCategoriesData.drinks.map((category) => fetchDrinksByCategory(category.strCategory));

      await Promise.all([...mealPromises, ...drinkPromises]);
      fetchRandomRecipes();
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching categories and recipes:', error);
      setError('Failed to fetch categories. Please try again later.');
      setIsLoading(false);
    }
  };

 const fetchRecipesByCategory = async (categoryName) => {
  setRecipes({}); // Kosongkan resep sebelumnya
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`);
    const data = await response.json();
    console.log(data); // Tambahkan log ini untuk melihat respons
    if (data.meals) {
      setRecipes((prev) => ({ ...prev, [categoryName]: data.meals }));
    } else {
      console.log(`No meals found for category: ${categoryName}`);
    }
  } catch (error) {
    console.error(`Error fetching recipes for category ${categoryName}:`, error);
  }
};


  const fetchDrinksByCategory = async (categoryName) => {
    try {
      const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${categoryName}`);
      const data = await response.json();
      setDrinkRecipes((prev) => ({ ...prev, [categoryName]: data.drinks }));
    } catch (error) {
      console.error(`Error fetching drinks for category ${categoryName}:`, error);
    }
  };

  const fetchRandomRecipes = async () => {
    try {
      const requests = Array.from({ length: 3 }, () => fetch('https://www.themealdb.com/api/json/v1/1/random.php'));
      const responses = await Promise.all(requests);
      const data = await Promise.all(responses.map((response) => response.json()));
      setRandomRecipes(data.map((item) => item.meals[0]));
    } catch (error) {
      console.error('Error fetching random recipes:', error);
    }
  };

const handleCategoryClick = (categoryName, isDrink = false) => {
  console.log(`Selected category: ${categoryName}, isDrink: ${isDrink}`); // Tambahkan log ini
  setSelectedCategory(categoryName);
  setIsCategoryView(!isDrink);
  
  if (isDrink) {
    // Jika kita memilih kategori minuman
    fetchDrinksByCategory(categoryName); // Ambil resep untuk kategori minuman
  } else {
    // Jika kita memilih kategori makanan
    fetchRecipesByCategory(categoryName); // Ambil resep untuk kategori makanan
  }
};


  const handleShowModal = async (recipe) => {
    const apiUrl = selectedCategory === 'Cocktail'
      ? `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${recipe.idDrink}`
      : `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const recipeDetails = selectedCategory === 'Cocktail' ? data.drinks[0] : data.meals[0];
      setSelectedRecipe(recipeDetails);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };

  const handleShareRecipe = () => {
    const recipeUrl = selectedRecipe.strSource || selectedRecipe.strYoutube;
    if (recipeUrl) {
      navigator.clipboard.writeText(recipeUrl).then(() => {
        alert('Recipe link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    } else {
      alert('No URL available to share.');
    }
  };

  // Fungsi untuk mendapatkan ingredients dari resep
  const getIngredients = (recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push(`${ingredient} - ${measure}`);
      }
    }
    return ingredients;
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">Recipeku</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#" onClick={() => { setIsCategoryView(true); setSelectedCategory(''); }}>Makanan</Nav.Link>
              <Nav.Link href="#" onClick={() => handleCategoryClick('Cocktail', true)}>Minuman</Nav.Link>
            </Nav>
            <Button variant="primary" onClick={handleShareRecipe}>Share Recipe</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form onSubmit={(e) => e.preventDefault()} className="search-form mb-4">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search for a recipe..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Form.Group>
          <Button type="submit">Search</Button>
        </Form>

        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading recipes, please wait...</p>
          </div>
        ) : (
          isCategoryView ? (
            <>
              <h4 className="text-center mt-5"> Food Categories</h4>
              {categories.map((category) => (
                <div key={category.strCategory} className="category-section mt-4">
                  <h5 className="category-title">{category.strCategory}</h5>
                  <Row>
                    {recipes[category.strCategory]?.slice(0, 10).map((recipe) => (
                      <Col md={6} key={recipe.idMeal} className="mb-4">
                        <div className="recipe-list-item" onClick={() => handleShowModal(recipe)}>
                          <div className="recipe-info">
                            <h6>{recipe.strMeal}</h6>
                          </div>
                          <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" />
                        </div>
                      </Col>
                    ))}
                  </Row>
                  {recipes[category.strCategory]?.length > 10 && (
                    <div className="text-center mt-3">
                      <Button onClick={() => handleCategoryClick(category.strCategory)}>
                        View All
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Kategori Minuman */}
            <h4 className="text-center mt-5">Drink Categories</h4>
            {drinkCategories.map((category) => (
              <div key={category.strCategory} className="category-section mt-4">
                <h5 className="category-title">{category.strCategory}</h5>
                <Row>
                  {drinkRecipes[category.strCategory]?.slice(0, 10).map((recipe) => (
                    <Col md={6} key={recipe.idDrink} className="mb-4">
                      <div className="recipe-list-item" onClick={() => handleShowModal(recipe)}>
                        <div className="recipe-info">
                          <h6>{recipe.strDrink}</h6>
                        </div>
                        <img src={recipe.strDrinkThumb} alt={recipe.strDrink} className="recipe-image" />
                      </div>
                    </Col>
                  ))}
                </Row>
                {drinkRecipes[category.strCategory]?.length > 10 && (
                  <div className="text-center mt-3">
                    <Button onClick={() => handleCategoryClick(category.strCategory, true)}>
                      View All
                    </Button>
                  </div>
                )}
              </div>
            ))}

              {randomRecipes.length > 0 && (
                <div className="random-recipes mt-5">
                  <h4 className="text-center">Random Recipes</h4>
                  <Row className="mt-4">
                    {randomRecipes.map((recipe) => (
                      <Col md={4} key={recipe.idMeal} className="mb-4">
                        <Card className="recipe-card" onClick={() => handleShowModal(recipe)}>
                          <Card.Img variant="top" src={recipe.strMealThumb} alt={recipe.strMeal} />
                          <Card.Body>
                            <Card.Title>{recipe.strMeal}</Card.Title>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </>
          ) : (
            <>
              <h4 className="text-center mt-5">Recipes in {selectedCategory}</h4>
              <Row>
                {(selectedCategory === 'Cocktail' ? drinkRecipes[selectedCategory] : recipes[selectedCategory])?.map((recipe) => (
                  <Col md={4} key={recipe.idDrink || recipe.idMeal} className="mb-4">
                    <Card className="recipe-card" onClick={() => handleShowModal(recipe)}>
                      <Card.Img
                        variant="top"
                        src={recipe.strDrinkThumb || recipe.strMealThumb}
                        alt={recipe.strDrink || recipe.strMeal}
                      />
                      <Card.Body>
                        <Card.Title>{recipe.strDrink || recipe.strMeal}</Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}

              </Row>
            </>
          )
        )}

        {selectedRecipe && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedRecipe.strDrink || selectedRecipe.strMeal}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <img
                src={selectedRecipe.strDrinkThumb || selectedRecipe.strMealThumb}
                alt={selectedRecipe.strDrink || selectedRecipe.strMeal}
                className="img-fluid mb-4"
              />
              <h5>Ingredients:</h5>
              <ul>
                {getIngredients(selectedRecipe).map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
              <h5>Instructions:</h5>
              <p>{selectedRecipe.strInstructions}</p>
              {selectedRecipe.strYoutube && (
                <div className="text-center">
                  <Button variant="primary" href={selectedRecipe.strYoutube} target="_blank">
                    Watch on YouTube
                  </Button>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleShareRecipe}>
                Share Recipe
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </>
  );
};

export default App;
