export async function uploadAudioToCloudinary(file) {
    const formData = new FormData();
  
    formData.append('file', file);
    formData.append('upload_preset', 'musicut');
  
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dol21ru2h/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error?.message || 'Upload thất bại');
    }
  
    return {
      url: data.secure_url,
      publicId: data.public_id,
      duration: data.duration || 0,
    };
  }