/**
 * Hàm chuyển đổi địa chỉ thành tọa độ sử dụng Nominatim
 * @param {string} address - Địa chỉ cần chuyển đổi
 * @returns {Promise<{lat: string, lon: string}>} - Tọa độ (latitude và longitude)
 */

//CONVERT ADDRESS TO COORDINATES
async function getCoordinates(place) {
  const baseUrl = "https://nominatim.openstreetmap.org/search";
  const params = new URLSearchParams({
    q: place,
    format: "json",
    addressdetails: "1",
    limit: "1",
  });

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error("Không tìm thấy kết quả cho địa chỉ này.");
    }

    const { lat, lon } = data[0];
    return { lat, lon };
  } catch (error) {
    console.error("Lỗi khi chuyển đổi địa chỉ:", error.message);
    throw error; // Propagate the error to the caller
  }
}

// Sử dụng hàm
// (async () => {
//   const address = "10 chơn tâm 11";
//   try {
//     const coordinates = await getCoordinates(address);
//     console.log(`Tọa độ của địa chỉ "${address}":`, coordinates);
//   } catch (error) {
//     console.error("Không thể lấy tọa độ:", error.message);
//   }
// })();

module.exports = getCoordinates;