const video = document.getElementById('video')
const overlay = document.getElementById('overlay')

Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(startVideo)

function startVideo(){
    // navigator.getUserMedia(
    //     {video: {}},
    //     stream => video.srcObject = stream,
    //     err => console.error(err)
    // )
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
        .then(
            (cameraStream) => {
                video.srcObject = cameraStream;
            }
        )
}

video.addEventListener('play',() =>{
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width : video.width, height : video.height}
    faceapi.matchDimensions(canvas, displaySize )
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, 
            new faceapi.SsdMobilenetv1Options()).withFaceLandmarks()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        // faceapi.draw.drawDetections(canvas, resizedDetections)
        // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

        const points = resizedDetections[0].landmarks._positions;
            console.log("Points:", points);
            const sunglass_width = Math.abs(parseInt((points[17]._x-points[1]._x)))
            const sunglass_height = Math.abs(parseInt((points[25]._y -points[30]._y)))
            // const sunglass_width = parseInt((points[17]._x-points[1]._x))
            // const sunglass_height = parseInt((points[25]._y -points[30]._y))
            
            const o_height = sunglass_height+'%';
            const o_width = sunglass_width+'%';
            
            // overlay.style.height = o_height;
            // overlay.style.width = o_width;
            
            var context = canvas.getContext('2d');
            
            context.drawImage(overlay,points[1]._x,points[25]._y,(sunglass_width*canvas.width)/100,sunglass_height);

        resizedDetections.forEach(detection => {
            const box = detection.detection.box
                        
            // const drawBox = new faceapi.draw.DrawBox(box, { label: "Age: " + Math.round(detection.age) + "\n Gender: " + detection.gender })
            // drawBox.draw(canvas)
        })
    }, 100)
    
})

// navigator.mediaDevices.getUserMedia({video:true}).then(function(stream){

//     vid.onloadedmetadata = function(){
//       this.width = this.videoWidth;
//       overlay.width = 220;
//       overlay.height = 218;
//       this.height = this.videoHeight;
//       }
//     vid.srcObject = stream;
//     vid.play();
//     overlay.onclick = function(){
//       var c = document.createElement('canvas');
//       c.width = vid.videoWidth;
//       c.height = vid.videoHeight;
//       c.getContext('2d').drawImage(vid, 0,0);
//       c.toBlob(doWhatYouWantWithTheCapturedImage);
//       };
//     });
  
//   function doWhatYouWantWithTheCapturedImage(blob){
//     var url = URL.createObjectURL(blob);
//     var img = new Image();
//     img.onload = function(){URL.revokeObjectURL(url);};
//     img.src = url;
//     URL.revokeObjectURL(vid.src);
//     overlay.parentNode.appendChild(img);
//     vid.parentNode.removeChild(vid);
//     overlay.parentNode.removeChild(overlay);
//     }