import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      api.get('/foods').then(response => {
        setFoods(response.data);
      });
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const postNewFood = await api.post('/foods', {
        name: food.name,
        description: food.description,
        price: food.price,
        image: food.image,
        available: true,
      });

      const newFoodData: IFoodPlate[] = [...foods, postNewFood.data];
      setFoods(newFoodData);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const postUpdatedFood = await api.put(`/foods/${editingFood.id}`, {
        name: food.name,
        description: food.description,
        price: food.price,
        image: food.image,
        available: editingFood.available,
      });

      const updatedFoodData: IFoodPlate[] = [...foods];

      const updatedFoodDataIndex = updatedFoodData.findIndex(
        foodIndex => foodIndex.id === editingFood.id,
      );

      updatedFoodData[updatedFoodDataIndex] = postUpdatedFood.data;
      setFoods(updatedFoodData);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);

    const foodData: IFoodPlate[] = [...foods];
    const deleteFoodData = foodData.findIndex(food => food.id === id);
    foodData.splice(deleteFoodData);
    setFoods(foodData);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    toggleEditModal();
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
