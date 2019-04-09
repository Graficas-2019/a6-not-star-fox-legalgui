var renderer = null, 
scene = null, 
camera = null,
root = null;
var object;
var animator = null,
group = null;
var duration = 20000; // ms
var score = 0;
var highScore = 0;
var upMove = 0;
var downMove = 0;
var rightMove = 0;
var leftMove = 0;
var upHit = false;
var downHit = false;
var rightHit = false;
var leftHit = false;
var timeLimit = 60;
var mesh = null;
var objLoader = null;
var tree = null;
var spaceShip = null;
var bullet = null;
var factor = 1000;
var currentTime = Date.now();
var spawnCurrentTime = Date.now();
var bullets = [];
var spaceShip_array = [];
var trees_array = [];
var trees_array_animations = [];
var maxTrees=10;
var tSpawn_trees = 0;
var lastTreeTime = 0;
var shipCreated = true;
var ssSize = null;
var sTime_ship = 0;
var nextShip_spawn = 1000;
var maxShips = 8;
var speeds = [];
var names = 0;
var camera;
var hasStarted = false;
var sTime;
var gTime = 0;
var nextTime = 1000;
var lastTShip = 0;
var healthPoints = 100;
var damage = 10;
var flag = false;

// Done
function spawnBullet()
{
    if(hasStarted){
        var position = new THREE.Vector3();
        position.setFromMatrixPosition( spaceShip.matrixWorld );

        var newBullet = cloneFbx(bullet);
        newBullet.position.set(position.x,position.y,90); 
        scene.add(newBullet);
        bullets.push(newBullet);
    }
}


// Done AS SEEN ON STACK OVERFLOW
function loadGLTF(){

    objLoader = new THREE.GLTFLoader();

    objLoader.load('./models/GhostShip/export.gltf', function (gltf){

        var object = gltf.scene;
        object.traverse(function ( child ){

            if(child instanceof THREE.Mesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        tree = object;
        tree.scale.set(.2,.2,.2);
    });

    objLoader = new THREE.GLTFLoader();

    objLoader.load('./models/Bomber/export.gltf', function (gltf){
        var object = gltf.scene;

        object.traverse(function( child ){
            if(child instanceof THREE.Mesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        spaceShip = object;
        spaceShip.position.set(0,0,90); 
        spaceShip.scale.set(.2,.2,.2);
        object.rotation.y += Math.PI; 
        scene.add(spaceShip);
        var box = new THREE.Box3().setFromObject(spaceShip);
        ssSize = box.getSize();
    });
    
    var geometry = new THREE.SphereGeometry( 0.5, 40, 40 );
    var material = new THREE.MeshBasicMaterial( {color: 0xff32CD32} );
    bullet = new THREE.Mesh( geometry, material );

}

// Done
function validateSpawn(x){
    if(x == 1)
        return tSpawn_trees < maxTrees;
    if(x == 2)
        return sTime_ship < maxShips;
}

// Done
function handleSpawn(condition){
    if(condition && 1){
        scene.remove(spaceShip_array[0]);
        sTime_ship -= 1;
        spaceShip_array.shift()
        shipCreated = false;
    }else if(condition && 2){
        scene.remove(trees_array.shift());
        tSpawn_trees--; 
    }
}

// Done
function clone(x, objs, h, obj, scale){
    var newObj = cloneFbx(obj);
    newObj.position.set(Math.floor(Math.random() * (Math.floor(72) - Math.ceil(-72) + 1)) + -62, h, -200)
    newObj.scale.set(scale, scale, scale);

    if(x == 'ship'){ 
        newObj.rotation.y += Math.PI; 
        newObj.status = 1;
        newObj.scale.set(.2,.2,.2);
    }else{

        newObj.move = 0;
        newObj.point = 1;
        newObj.status = 1;
        newObj.name = names;
        newObj.scale.set(.3,.3,.3);
        speeds.push(0.1);
    }

    objs.push(newObj);
    scene.add(newObj);
   
}

// Done
function spawnTree(now, deltat){
    if (validateSpawn(1)){
        if(deltat > nextTime){

            nextTime = Math.floor(Math.random() * (Math.floor(700) - Math.ceil(100) + 1)) + 100;
            lastTreeTime = now;
            spawnCurrentTime = now;
            tSpawn_trees += 1;
            clone('tree', trees_array, 2, tree, 3);
            handleSpawn(!names, 2);
            names += 1;
        }

    }
}


// Done
function spawnShip(now, deltat){
   if (validateSpawn(2)){
        if(deltat > nextShip_spawn){
            nextShip_spawn = Math.floor(Math.random() * (Math.floor(1200) - Math.ceil(100) + 1)) + 100;
            lastTShip = spawnCurrentTime = now;
            sTime_ship += 1;
            var y = Math.floor(Math.random() * (Math.floor(40) - Math.ceil(2) + 1)) + 2;
            clone('ship', spaceShip_array, y, spaceShip, 3);
            handleSpawn(shipCreated, 1);
        }
    }
}

// Done
function removeObjects(objs){
    if(objs.length){
        for(var actual = 0; actual < objs.length; actual++){
            scene.remove(objs[actual]) 
        }   
        objs = []
    }
}

// Done
function updateScore(a, b){
    if(a < b)
        highScore = b;
}

// Done
function moveX(direction, deltat){
    if(spaceShip.position.x <= -50 || spaceShip.position.x >= 50)
        spaceShip.position.x = 0;
    if(spaceShip.position.x >= -50 && spaceShip.position.x <= 50)
        spaceShip.position.x += deltat * direction; 
}

// Done
function moveY(direction, deltat){
    if(spaceShip.position.y < 0 || spaceShip.position.y > 40)
        spaceShip.position.y = 0;
    if(spaceShip.position.y >= 0 && spaceShip.position.y <= 40){
        spaceShip.position.y += deltat * direction;   
    }
}

// Done
function checkGame(now, deltat){

    sTime = now;
    gTime += 1;
    t = (10000 - gTime);
    document.getElementById("time").innerHTML = "Time: " + t.toString();
    
    if(!healthPoints || gTime >= 10000){
        document.getElementById("startButton").style.visibility = "visible";
        hasStarted = false;
    }
}

// Done
function handleFoeCollisions(deltat, objs, x){

    if (objs.length){
        var actual = 0;
        firstBB = new THREE.Box3().setFromObject(spaceShip);

        objs.forEach(function(obj){

            if(x == "ships"){
                obj.position.z += deltat * 0.3;
            }else{
                obj.position.z += speeds[actual] * deltat;
            }

            secondBB = new THREE.Box3().setFromObject(obj);
            var collision = firstBB.intersectsBox(secondBB);


            if(obj.position.z > 110 || collision){   
                if(x == "ships"){
                    sTime_ship--;
                    scene.remove(spaceShip_array[actual]);
                    spaceShip_array.shift()
                }
                else{
                    tSpawn_trees--;
                    scene.remove(objs.shift());
                }           
                
            }

            if(collision){
                healthPoints -= damage;
                document.getElementById("life").innerHTML = "Health: " + healthPoints;
            }

        actual++;    
        })
    }
}

// Done
function handleBulletCollision(deltat){

      if (bullets.length){

        bullets.forEach(function(bullet){
             bullet.position.z -= deltat * 0.2;

            if(bullet.position.z){   
                firstBB = new THREE.Box3().setFromObject(bullet);
                spaceShip_array.forEach(function(spaceShip){

                    secondBB = new THREE.Box3().setFromObject(spaceShip);
                    var collision = firstBB.intersectsBox(secondBB);
                    if(spaceShip.status == 1  && collision){

                        score += 10;
                        spaceShip.status = 0;
                        scene.remove(spaceShip);
                        document.getElementById("score").innerHTML = "score: " + score;
                    }
                })
            }

            else{
                scene.remove(bullet);
                bullets.shift()
            }   
        })
        
    }
}

// Done
function checkMovements(deltat){
    if (rightHit){ moveX(rightMove, deltat); }
    if (leftHit){ moveX(leftMove, deltat); }
    if (upHit){ moveY(upMove, deltat); }
    if (downHit){ moveY(downMove, deltat); }
}

// Done
function handleCollisions(deltat){
    handleFoeCollisions(deltat, trees_array, "trees_array");
    handleFoeCollisions(deltat, spaceShip_array, "ships");
    handleBulletCollision(deltat);
}

// Done
function animate() {
    KF.update();
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    spawnTree(now, now - lastTreeTime);
    spawnShip(now, now - lastTShip);
    checkMovements(deltat);
    checkGame(now, now - sTime);
    handleCollisions(deltat);
}

// Done
function run() {
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    render();

    if(hasStarted){
        // Update the animations
        animate();
        
    }
    
}

// Done
function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "./images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;


// Done
function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 10,130);
    var look = new THREE.Vector3(0,0,0);
    camera.lookAt(look);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(0, 70, 0);
    spotLight.target.position.set(0, 0, 0);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 400;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    // Create the objects
    loadGLTF();
    
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var mapURL = "./images/GrassTexture.jpg";
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;
    
    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(300, 400, 50, 50);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    
    // Now add the group to our scene
    scene.add( root );

    raycaster = new THREE.Raycaster();
    window.addEventListener( 'resize', onWindowResize);

}

// Done
function init(){
    lastTreeTime = Date.now();
    sTime = Date.now();
    healthPoints = 100;
    gTime = 0;
    score = 0;
    names = 0;
    tSpawn_trees = 0;
}

// Done
function start()
{
    if(flag){
        removeObjects(trees_array);
        removeObjects(spaceShip_array);
        removeObjects(bullets);
        updateScore(highScore, score);
        document.getElementById("startButton").style.visibility = "hidden";

    }else{
        flag = true;
        document.getElementById("startButton").style.visibility = "hidden";
        document.getElementById("startButton").value = "Restart";
    }
   
    
    init();
    
    t = 60;
    document.getElementById("life").innerHTML = "Health: " + healthPoints;
    document.getElementById("time").innerHTML = "Time: " + t.toString();
    document.getElementById("highscore").innerHTML = "Highscore: " + highScore;
    document.getElementById("score").innerHTML = "Score: " + score;
    hasStarted = true;
    
}

// Done
function playAnimations()
{    
    console.log('Animation playing')
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, 1], 
                    values:[{ x : 0, y : 0 },
                            { x : 0, y : 1 },],
                    target:mesh.material.map.offset
                },
            ],
        loop: true,
        duration: factor,
    });
        animator.start();           
}

// Done
function render() 
{
    renderer.render( scene, camera );
}
// Done
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}