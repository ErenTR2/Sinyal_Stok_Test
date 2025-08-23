import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';

export default function DraggableColumns({ allWarehouses, onOrderChange }) {
  const [order, setOrder] = useState([]);

  useEffect(() => {
    api.get('/preferences/columns').then(r => {
      const saved = r.data;
      const ids = allWarehouses.map(w => w.id);
      const merged = [...saved.filter(id => ids.includes(id)), ...ids.filter(id => !saved.includes(id))];
      setOrder(merged);
      onOrderChange(merged);
    });
  }, [allWarehouses?.length]);

  function handleDragEnd(result) {
    if (!result.destination) return;
    const newOrder = Array.from(order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setOrder(newOrder);
    onOrderChange(newOrder);
    api.post('/preferences/columns', newOrder);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="cols" direction="horizontal">
        {(provided) => (
          <tr ref={provided.innerRef} {...provided.droppableProps}>
            <th>Malzeme Adı</th>
            <th>Genel Stok</th>
            {order.map((id, index) => {
              const w = allWarehouses.find(x => x.id === id);
              if (!w) return null;
              return (
                <Draggable draggableId={String(id)} index={index} key={id}>
                  {(p) => (
                    <th ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                      {w.name}
                    </th>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </tr>
        )}
      </Droppable>
    </DragDropContext>
  )
}
