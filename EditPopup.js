import React from "react";

const EditPopup = ({
  formData,
  handleInputChange,
  saveEditedVehicle,
  cancelEdit
}) => {
  return (
    <div className="edit-popup">
      <h2>Edit Vehicle</h2>
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
        placeholder="Price"
        step="0.01"
        required
      />
      <button onClick={saveEditedVehicle}>Update</button>
      <button onClick={cancelEdit}>Cancel</button>
    </div>
  );
};

export default EditPopup;
