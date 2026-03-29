export const SEARCH_ROOMS_QUERY = `
  query SearchRooms($input: SearchRoomsInput!) {
    searchRooms(input: $input) {
      items {
        roomTypeId
        roomTypeName
        description
        occupancy
        amenities
        images
        baseRate
        totalPrice
        availableCount
        roomSpec {
          roomSpecId
          bedType
          area
          minOcc
          maxOcc
        }
      }
      filters {
        filterKey
        filterType
        options {
          value
          count
        }
        minValue
        maxValue
      }
      page
      size
      totalItems
      totalPages
      hasNext
      hasPrevious
    }
  }
`;
