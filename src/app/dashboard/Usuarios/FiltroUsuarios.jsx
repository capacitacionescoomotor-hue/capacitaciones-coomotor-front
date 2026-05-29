'use client'
import { Search, Plus } from 'lucide-react'

export default function FiltroUsuarios({ onBuscar, onFiltrar, onAgregar }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      {/* Buscador */}
      <div className="relative w-full md:w-1/3">
        <Search className="absolute top-3 left-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar usuario..."
          onChange={(e) => onBuscar(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 
                     text-gray-800 placeholder:text-gray-400
                     bg-white focus:ring-2 focus:ring-[#0266ff] focus:border-[#0266ff] outline-none"
        />
      </div>

      {/* Filtro y botón */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          onChange={(e) => onFiltrar(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800
                     bg-white focus:ring-2 focus:ring-[#0266ff] outline-none"
        >
          <option value="Todos">Todos los roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>

        <button
          onClick={onAgregar}
          className="flex items-center bg-[#0266ff] text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-all"
        >
          <Plus size={18} className="mr-2" />
          Añadir usuario
        </button>
      </div>
    </div>
  )
}