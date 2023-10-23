const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "InventoryManagement",
  password: "admin",
  port: 5432, 
});


pool.connect((err) => {
  if (err) {
    console.log("Error connecting to PostgreSQL: " + err);
  } else {
    console.log("Connected to PostgreSQL");
  }
});


app.get("/api/vehicles", (req, res) => {
  pool.query("SELECT * FROM new_vehicle", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred." });
    } else {
      res.json(result.rows);
    }
  });
});


app.put("/api/vehicles/:id", (req, res) => {
  const id = req.params.id; 
  const { make, model, year, price, status } = req.body;

  const queryText = `
    UPDATE new_vehicle
    SET Make = $1, Model = $2, Year = $3, Price = $4, Status = $5
    WHERE id = $6
  `;

  const values = [make, model, year, price, status, id];

  pool.query(queryText, values, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred." });
    } else {
      res.json({ message: "Vehicle updated successfully" });
    }
  });
});

app.get("/api/Searchvehicles", (req, res) => {
  debugger;
  const searchTerm = req.query.search; 
  let queryText;

  if (searchTerm) {
    
    queryText = `
      SELECT * FROM new_vehicle
      WHERE
        make ILIKE $1
        OR model ILIKE $1
        OR year::text ILIKE $1
        OR price::text ILIKE $1
        OR status ILIKE $1
    `;
  } else {
    
    queryText = "SELECT * FROM new_vehicle";
  }

  const values = [`%${searchTerm}%`];

  pool.query(queryText, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred." });
    } else {
      res.json(result.rows);
    }
  });
});




app.patch("/api/vehicles/:id", (req, res) => {
  const id = req.params.id; 

  
  if (req.body.status && req.body.status === "Sold") {
    
    const queryText = `
      UPDATE new_vehicle
      SET Status = $1
      WHERE id = $2
    `;

    const values = ["Sold", id];

    pool.query(queryText, values, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while marking the vehicle as sold." });
      } else {
        res.json({ message: "Vehicle marked as sold successfully" });
      }
    });
  } else {
    res.status(400).json({ error: "Invalid request. Please provide 'status' as 'Sold'." });
  }
});





app.delete("/api/vehicles/:id", (req, res) => {
  const id = req.params.id; 

  const queryText = "DELETE FROM new_vehicle WHERE id = $1";
  const values = [id];

  pool.query(queryText, values, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred." });
    } else {
      res.json({ message: "Vehicle deleted successfully" });
    }
  });
});

app.post("/api/vehicles", (req, res) => {
  const { make, model, year, price, status } = req.body; 
  const queryText =
    "INSERT INTO new_vehicle (Make, Model, Year, Price, Status) VALUES ($1, $2, $3, $4, $5)"; 
  const values = [make, model, year, price, status]; 

  pool.query(queryText, values, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "An error occurred." });
    } else {
      res.json({ message: "Vehicle added successfully" });
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
