import React from 'react'
import SearchBar from '../../components/common/Searchbar'
import Button from '../../components/buttons/Button'
import { HiOutlineArchiveBox } from 'react-icons/hi2'
import { Outlet, useNavigate } from 'react-router-dom'

const Quality = () => {
  const navigate = useNavigate();
  return (
    <div> 
      <div className="flex flex-row  gap-4 md:gap-6 bg-transparent mx-auto">
        <div className="w-72">
          <SearchBar placeholder="Search using Name" />
        </div>
        <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs"
          onClick={() => navigate('create_ticket')}
        >
          Create a ticket
        </Button>
      </div>
      <Outlet />
    </div>
  )
}

export default Quality