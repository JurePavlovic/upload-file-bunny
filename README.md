### Upload file script
Script that uploads a video to bunny.net using the [**tus**](https://tus.io/) protocol 

#### Usage
```bash
npm i
node index.js --file test.mp4 --init tus-init.json   
```

tui-init.json should contain the response from 

`POST {{API_URL}}/api/v1/properties/:propertyId/units/:unitId/collections/:collectionId/video`
