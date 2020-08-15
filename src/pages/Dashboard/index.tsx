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
      const { data } = await api.get<IFoodPlate[]>('/foods');
      setFoods(data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data: addedFood } = await api.post<IFoodPlate>('/foods', {
        name: food.name,
        description: food.description,
        price: food.price,
        available: true,
        image: food.image,
      });

      setFoods(oldFoods => [...oldFoods, addedFood]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { id, available } = editingFood;
      const { data: updatedFood } = await api.put<IFoodPlate>(`/foods/${id}`, {
        ...food,
        available,
        id,
      });

      const newFoods = foods.map(currentFood => {
        if (currentFood.id === id) {
          return updatedFood;
        }

        return currentFood;
      });

      setFoods([...newFoods]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete<IFoodPlate>(`/foods/${id}`);
      const updatedFoods = foods.filter(food => food.id !== id);

      setFoods(updatedFoods);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFoodAvailability(
    food: IFoodPlate,
    available: boolean,
  ): Promise<void> {
    const { id } = food;

    try {
      const { data: updatedFood } = await api.put<IFoodPlate>(`/foods/${id}`, {
        ...food,
        available,
        id,
      });

      const newFoods = foods.map(currentFood => {
        if (currentFood.id === id) {
          return updatedFood;
        }

        return currentFood;
      });

      setFoods([...newFoods]);
    } catch (err) {
      console.log(err);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
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
              handleFoodAvailability={handleFoodAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
