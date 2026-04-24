// EMMANUELLA OBIDIKE
//The function uploads an image file to the FastAPI backend
// The backend then uploads it to S3 and return an image_key

const API_URL = import.meta.env.VITE_API_URL; // Use VITE_API_URL from .env production file
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/uploads/upload-image`, { // updated url
    method: "POST",
    body: formData,
    credentials: "include", // Include cookies for authentication 
  });

  // check for error first
  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  // use res, not response
  const data = await res.json();

  console.log("UPLOAD RESPONSE:", data);

  return data; // { image_key: "something.webp" }
}
