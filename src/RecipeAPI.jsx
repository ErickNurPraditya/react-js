// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Navbar, Nav, Spinner } from 'react-bootstrap';
// eslint-disable-next-line no-unused-vars
import Homepage from './Homepage';
// eslint-disable-next-line no-unused-vars
import Footer from './Footer';


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
    console.log(`Selected category: ${categoryName}, isDrink: ${isDrink}`);
    setSelectedCategory(categoryName);
    setIsCategoryView(false); // Mengubah tampilan ke seluruh resep di kategori
  
    if (isDrink) {
      if (!drinkRecipes[categoryName]) {
        // Jika tidak ada data minuman dari kategori ini, fetch data
        fetchDrinksByCategory(categoryName);
      }
    } else {
      if (!recipes[categoryName]) {
        // Jika tidak ada data makanan dari kategori ini, fetch data
        fetchRecipesByCategory(categoryName);
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setIsCategoryView(false);
      setRecipes({}); // Kosongkan resep sebelumnya
  
      if (query.trim() === '') {
        setIsCategoryView(true); // Kembali ke tampilan kategori jika input kosong
        setIsLoading(false);
        return;
      }
      
  
      const foodResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const drinkResponse = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
  
      const foodData = await foodResponse.json();
      const drinkData = await drinkResponse.json();
  
      if (foodData.meals || drinkData.drinks) {
        setRecipes({ 'Search Results': foodData.meals || [] });
        setDrinkRecipes({ 'Search Results': drinkData.drinks || [] });
      } else {
        setRecipes({ 'Search Results': [] });
        setDrinkRecipes({ 'Search Results': [] });
      }
  
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching for recipes:', error);
      setError('Failed to search for recipes. Please try again later.');
      setIsLoading(false);
    }
  };
  
  
  // eslint-disable-next-line no-unused-vars
  const handleFoodClick = async () => {
    try {
      setSelectedCategory(''); // Mengatur ulang kategori terpilih
      setIsCategoryView(true); // Mengatur ulang tampilan ke view kategori
      setDrinkRecipes({}); // Mengosongkan data resep minuman
      setRecipes({}); // Mengosongkan data resep sebelumnya
  
      // Fetch data resep untuk setiap kategori makanan
      const mealCategoriesResponse = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
      const mealCategoriesData = await mealCategoriesResponse.json();
  
      setCategories(mealCategoriesData.categories);
  
      // Ambil data resep untuk setiap kategori makanan
      const mealPromises = mealCategoriesData.categories.map((category) =>
        fetchRecipesByCategory(category.strCategory)
      );
      await Promise.all(mealPromises);
    } catch (error) {
      console.error('Error fetching food recipes:', error);
      setError('Failed to fetch food recipes. Please try again later.');
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

  const handleBackToCategories = () => {
    setSelectedCategory('');
    setIsCategoryView(true);
    fetchAllCategories(); // Memanggil kembali fetchAllCategories untuk memperbarui daftar kategori
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
    <Navbar.Brand href="#home">
      <img
        src="/src/pikaso_embed (1).png" // Ganti dengan URL atau path lokal gambar kamu
        alt="Logo"
        width="40" // Sesuaikan ukuran gambar
        height="40" // Sesuaikan ukuran gambar
        className="d-inline-block align-top"
      />{' '}
      MyRecipe
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
      <Nav.Link href="#" onClick={handleFoodClick}>Food</Nav.Link>
        <Nav.Link href="#" onClick={() => handleCategoryClick('Cocktail', true)}>Drink</Nav.Link>
      </Nav>
      <button className="share-button"
  onClick={() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link recipe berhasil disalin!'))
      .catch(err => console.error('Gagal menyalin link: ', err));
  }}
>
  Share
</button>
    </Navbar.Collapse>
  </Container>
</Navbar>


      <Homepage />

      <Container>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form mb-4">
  <div className="search-group">
    <Form.Control
      type="text"
      placeholder="Search for a recipe..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="search-input"
    />
    <Button type="submit" className="search-button">Search</Button>
  </div>
</Form>


        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading recipes, please wait...</p>
          </div>
        ) : (
          isCategoryView ? (
            <>
              <h4 className="text-center mt-5">Food Categories</h4>
              {categories.slice(0, 3).map((category) => (
                <div key={category.strCategory} className="category-section mt-4">
                  <h5 className="category-title">{category.strCategory}</h5>
                  <Row>
                    {recipes[category.strCategory]?.slice(0, 5).map((recipe) => (
                      <Col md={6} key={recipe.idMeal} className="mb-4">
                        <div className="recipe-list-item" onClick={() => handleShowModal(recipe)}>
                          <div className="recipe-info">
                            <h6>{recipe.strMeal}</h6>
                            <strong>Ingredients:</strong>
                            <ul>
                              {/* Mengambil dan menampilkan bahan-bahan dari recipe */}
                              {Object.keys(recipe)
                                .filter(key => key.includes('strIngredient') && recipe[key]).slice(0, 2)
                                .map((ingredient, index) => (
                                  <li key={index}>{recipe[ingredient]}</li>
                                ))}
                            </ul>
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
            {drinkCategories.slice(0, 3).map((category) => (
              <div key={category.strCategory} className="category-section mt-4">
                <h5 className="category-title">{category.strCategory}</h5>
                <Row>
                  {drinkRecipes[category.strCategory]?.slice(0, 5).map((recipe) => (
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
              <Button variant="secondary" onClick={handleBackToCategories} className="mb-4">
              Back to Categories
            </Button>
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

{!isCategoryView && (
  <>
    <h4 className="text-center mt-5">Search Results</h4>
    <Row>
      {recipes['Search Results']?.map((recipe) => (
        <Col md={4} key={recipe.idMeal} className="mb-4">
          <Card className="recipe-card" onClick={() => handleShowModal(recipe)}>
            <Card.Img variant="top" src={recipe.strMealThumb} alt={recipe.strMeal} />
            <Card.Body>
              <Card.Title>{recipe.strMeal}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
      {drinkRecipes['Search Results']?.map((recipe) => (
        <Col md={4} key={recipe.idDrink} className="mb-4">
          <Card className="recipe-card" onClick={() => handleShowModal(recipe)}>
            <Card.Img variant="top" src={recipe.strDrinkThumb} alt={recipe.strDrink} />
            <Card.Body>
              <Card.Title>{recipe.strDrink}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </>
)}


{selectedRecipe && (
  <Modal show={showModal} onHide={handleCloseModal}>
    <Modal.Header closeButton>
      <Modal.Title>{selectedRecipe.strDrink || selectedRecipe.strMeal}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
        <img
          src={selectedRecipe.strDrinkThumb || selectedRecipe.strMealThumb}
          alt={selectedRecipe.strDrink || selectedRecipe.strMeal}
          className="img-fluid"
          style={{ width: '150px', height: 'auto', marginRight: '20px' }}
        />
        <div style={{ flex: 1 }}>
          <h5>Ingredients:</h5>
          <ul>
            {getIngredients(selectedRecipe).map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h5>Instructions:</h5>
          <p>{selectedRecipe.strInstructions}</p>
        </div>
      </div>
      {selectedRecipe.strYoutube && (
        <div className="text-center">
          <h5>Watch the video</h5>
          <iframe
            width="100%"
            height="315"
            src={selectedRecipe.strYoutube.replace("watch?v=", "embed/")}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
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
<Footer />
      </Container>
    </>
  );
};

export default App;
