

export const processImage = async (req, id) => {
    if (req.files && req.files.image !== undefined && req.files.image !== '' && req.files.image !== null) {
        const _image = req.files.image;
        const image_name = `${id}.jpg`;
        _image.mv("./public/images/" + image_name);
        return image_name;
    } else {
        return 'default.jpg';
    }
};