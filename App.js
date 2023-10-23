import React, { useState, useEffect } from "react";
import "./App.css";
import EditPopup from "./EditPopup";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import 'chart.js/auto'; 

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    status: "Live",
    id: "",
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  function SuccessMessage({ message, onClose }) {
    return (
      <div className="success-message-popup">
        <div className="success-message-content">
          <p>{message}</p>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);

  const baseURL = "http://localhost:5001/api/vehicles";
  const searchURL = "http://localhost:5001/api/Searchvehicles";

  useEffect(() => {
    axios
      .get(`${baseURL}?search=${searchTerm}`)
      .then((response) => {
        setVehicles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
      });
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addVehicle = () => {
    if (formData.make && formData.model && formData.year && formData.price && formData.status) {
      const data = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        status: formData.status,
      };

      axios
        .post(`${baseURL}`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.status === 200) {
            setVehicles((prevVehicles) => [
              ...prevVehicles,
              { ...formData, sold: false },
            ]);
            setFormData({ make: "", model: "", year: "", price: "" });
            setShowInput(false);
            showSuccess("Vehicle added successfully");
          } else {
            console.error("Error adding a vehicle:", response.statusText);
          }
        })
        .catch((error) => {
          console.error("Network error:", error);
        });
    } else {
      alert("All fields are required");
    }
  };

  const editVehicle = (index) => {
    setEditingIndex(index);
    setFormData(vehicles[index]);
  };

  const handleSearch = () => {
    fetchVehicles();
  };

  const fetchVehicles = () => {
    axios
      .get(`${searchURL}?search=${searchTerm}`)
      .then((response) => {
        setVehicles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
      });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const saveEditedVehicle = () => {
    if (formData.make && formData.model && formData.year && formData.price) {
      const id = formData.id;

      const data = {
        id: id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        status: formData.status,
      };

      axios
        .put(`${baseURL}/${id}`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          const updatedVehicles = [...vehicles];
          const vehicleIndex = vehicles.findIndex((vehicle) => vehicle.id === id);

          if (vehicleIndex !== -1) {
            updatedVehicles[vehicleIndex] = data;
          }

          setVehicles(updatedVehicles);
          setFormData({
            make: "",
            model: "",
            year: "",
            price: "",
            status: "Live",
            id: "",
          });
          setEditingIndex(null);
          showSuccess("Vehicle updated successfully");
        })
        .catch((error) => {
          console.error("Error updating the vehicle:", error);
        });
    } else {
      alert("Make, Model, Year, and Price fields are required");
    }
  };

  const markAsSold = (index) => {
    const id = vehicles[index].id;
    const data = {
      status: "Sold",
    };

    axios
      .patch(`${baseURL}/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        const updatedVehicles = [...vehicles];
        updatedVehicles[index].status = "Sold";
        setVehicles(updatedVehicles);
        showSuccess("Vehicle Updated as Sold");
      })
      .catch((error) => {
        console.error("Error marking as sold:", error);
      });
  };

  const handleDelete = (index) => {
    setConfirmDelete(true);
    setDeletingIndex(index);
  };

  const confirmDeleteVehicle = () => {
    if (deletingIndex !== null) {
      const id = vehicles[deletingIndex].id;

      axios
        .delete(`${baseURL}/${id}`)
        .then(() => {
          const updatedVehicles = [...vehicles];
          updatedVehicles.splice(deletingIndex, 1);
          setVehicles(updatedVehicles);
          setConfirmDelete(false);
          setDeletingIndex(null);
          showSuccess("Vehicle deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting the vehicle:", error);
        });
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setDeletingIndex(null);
  };

  
  const statusData = {
    labels: ["Live", "Sold"],
    datasets: [
      {
        label: "Status",
        data: [
          vehicles.filter((vehicle) => vehicle.status === "Live").length,
          vehicles.filter((vehicle) => vehicle.status === "Sold").length,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  // Status histogram options
  const statusOptions = {
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="App">
      <h1>Vehicle Inventory System</h1>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button> &nbsp;&nbsp;&nbsp; 
        
        <div className="chart-container">
        <Bar
          data={statusData}
          options={{
          responsive: true, 
          maintainAspectRatio: false, 
          scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
          },
          }}
          height={200} 
          width={400}  
        />
        </div>
        {showInput ? (
          <div>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              placeholder="Make"
              required
            />
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="Model"
              required
            />
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="Year"
              required
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="$Price"
              step="0.01"
              required
            />
            <button onClick={addVehicle}>Add Vehicle</button>
          </div>
        ) : (
          <button onClick={() => setShowInput(true)}>Add New Vehicle</button>
          
        )}
       
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle, index) => (
          <div key={index} className="vehicle-entry">
            <input type="hidden" name="id" value={vehicle.id} />
            <div className="vehicle-field">
              <p>
                <strong>Make:</strong> {vehicle.make}
              </p>
            </div>
            <div className="vehicle-field">
              <p>
                <strong>Model:</strong> {vehicle.model}
              </p>
            </div>
            <div className="vehicle-field">
              <p>
                <strong>Year:</strong> {vehicle.year}
              </p>
            </div>
            <div className="vehicle-field">
              <p>
                <strong>Price:</strong> ${vehicle.price}
              </p>
            </div>
            <div className="vehicle-field">
              <p>
                <strong>Status:</strong> {vehicle.status}
              </p>
            </div>
            <div className="button-container">
        {vehicle.status === "Live" ? (
          <>
            <button onClick={() => markAsSold(index)}>Mark as Sold</button>
            <button onClick={() => editVehicle(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </>
        ) : (
          <>
            <button style={{
          backgroundColor: 'gray',
          color: 'white',
          cursor: 'not-allowed',
        }}
         disabled>Mark as Sold</button>
           <button>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </>
        )}
      </div>
          </div>
        ))}
      </div>

      {editingIndex !== null && (
        <EditPopup
          formData={formData}
          handleInputChange={handleInputChange}
          saveEditedVehicle={saveEditedVehicle}
          cancelEdit={() => setEditingIndex(null)}
        />
      )}

      {confirmDelete && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this vehicle?</p>
          <button onClick={confirmDeleteVehicle}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      )}
      {showSuccessMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setShowSuccessMessage(false)}
        />
      )}
    </div>
  );
}

export default App;
