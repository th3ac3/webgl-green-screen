var gl, canvas, shaderProgram;

var mvMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();
var mvStack = [];

var itemBuffers = [];

var images = [];
var videos = [];
var textures = [];

// Settings
var s = {
    // Fg bg Texture indexes
    fgI: 0,
    bgI: 0,
    // Is fg/bg texture a video?
    isVideoFg: false,
    isVideoBg: false,
    // Currently selected item to draw
    itemIndex: 0,
    doLight: 1,
    mode: 0,
    // Light settings
    lR: 2,
    ylight: 2,
    lpos: {},

    shaderIndex: 0,
    x0: 0,
    y0: 0,
    move: 0,
    th: 0,
    ph: 0,
    zh: 0,
    fov: 55,
    dim: 3,
    asp: 0,
    old: {},
}

function initGL() {
    try {
        canvas = document.getElementById("canvas");
        gl = canvas.getContext("experimental-webgl");
        var size = Math.min(window.innerWidth, window.innerHeight) - 10;
        canvas.width = canvas.height = size;
        s.asp = 1; // size / size

        gl.viewport(0, 0, size, size);
    } catch(e) {}

    if (!gl)
        alert("Your browser does not support WebGL. See http://get.webgl.org");
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript)
        return null;

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;

        k = k.nextSibling;
    }

    var shader;
    switch (shaderScript.type) {
        case "x-shader/x-fragment":
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        case "x-shader/x-vertex":
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
        default:
            return null;
            break;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {
    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShaders = [];
    fragmentShaders[0] = getShader(gl, "shader-fs");
    fragmentShaders[1] = getShader(gl, "shader-green-screen");
    fragmentShaders[2] = getShader(gl, "shader-checkerboard");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShaders[s.shaderIndex]);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "XYZ");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "RGB");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "TEX");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "NORM");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "PMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "MVMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "VMatrix");
    shaderProgram.tex1 = gl.getUniformLocation(shaderProgram, "tex1");
    shaderProgram.tex2 = gl.getUniformLocation(shaderProgram, "tex2");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "NMatrix");
    shaderProgram.noTexture = gl.getUniformLocation(shaderProgram, "noTexture");

    shaderProgram.ambientUniform = gl.getUniformLocation(shaderProgram, "Ambient");
    shaderProgram.diffuseUniform = gl.getUniformLocation(shaderProgram, "Diffuse");
    shaderProgram.specularUniform = gl.getUniformLocation(shaderProgram, "Specular");
    shaderProgram.lPosUniform = gl.getUniformLocation(shaderProgram, "LightPos");
}

// From https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_textures_in_WebGL 
function setupVideo(url) {
    var video = document.createElement('video');

    var playing = false;
    var timeupdate = false;

    video.crossOrigin = ""; // same as cO = "anonymous"
    video.autoplay = true;
    video.muted = true;
    video.loop = true;

    // Waiting for these 2 events ensures
    // there is data in the video
    video.addEventListener('playing', function() {
        playing = true;
        checkReady();
    }, true);

    video.addEventListener('timeupdate', function() {
        timeupdate = true;
        checkReady();
    }, true);

    video.src = url;

    function checkReady() {
        video.copyVideo = playing && timeupdate;
    }

    videos.push(video);
}

function initVideoTexture(src) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because video has to be download over the internet
    // they might take a moment until it's ready so
    // put a single pixel in the texture so we can
    // use it immediately.
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        pixel)

    // Turn off mips and set wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Load the video
    setupVideo(src);

    return texture;
}

function initImageTexture(src) {
    var tex = gl.createTexture();
    tex.image = new Image();
    tex.image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    tex.image.src = src;
    images.push(tex.image);

    return tex;
}

function initTextures() {
    textures[0] = initImageTexture("crate.png");
    textures[1] = initVideoTexture("./videos/Firefox.mp4");
    textures[2] = initVideoTexture("./videos/green_screen.mp4");
    textures[3] = initVideoTexture("https://r6---sn-qxoedn7d.googlevideo.com/videoplayback?requiressl=yes&clen=1879333&mime=video%2Fmp4&source=youtube&key=cms1&ipbits=0&itag=18&c=WEB&ratebypass=yes&gir=yes&expire=1519273840&dur=20.387&pl=17&ip=155.94.234.2&sparams=clen,dur,ei,expire,gir,id,ip,ipbits,ipbypass,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&ei=EPONWtDEFayB_APKtaXwAw&id=o-ACX0xX3ADMn0KKpOjX6EKJ7axs2eYmqbxYt06dbnxkdt&fvip=6&lmt=1519244819622029&signature=039523B1A903D836CEFCA6B9F15532ECE865C66E.3EA9548AB1D7C16A2B032C205EFCC12C6ABD3AD6&redirect_counter=1&rm=sn-a5mds7s&req_id=8692d823f52da3ee&cms_redirect=yes&ipbypass=yes&mip=76.120.64.78&mm=31&mn=sn-qxoedn7d&ms=au&mt=1519252168&mv=m");
    //textures[3] = initVideoTexture("./videos/yosemite.mp4");

    // Skip the first 15s of greenscreen video
    getVideo(2).addEventListener('loadedmetadata', function() {
        this.currentTime = 20;
    }, false);
}

function updateTexture(texture, video) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
}

function isVideo(index) {
    return !(index < images.length);
}

function getVideo(textureIndex) {
    if (!isVideo(textureIndex))
        throw "Error: Not a video!";
    return videos[textureIndex - images.length];
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// From http://learningwebgl.com/lessons/lesson11/index.html
function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvStack.push(copy);
}

function mvPopMatrix() {
    if (mvStack.length == 0)
        throw "Invalid popMatrix!";
    mvMatrix = mvStack.pop();
}

function setMatrixUniforms() {
    //  Set projection and modelview matrixes
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix));
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix));
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, new Float32Array(vMatrix));

    var nMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, nMatrix);
    mat3.transpose(nMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, new Float32Array(nMatrix));
}

function drawLight() {
    const sphereIndex = 2;

    if (s.doLight) {
        s.lpos.x = s.lR * Math.cos(degToRad(s.zh));
        s.lpos.y = s.ylight;
        s.lpos.z = s.lR * Math.sin(degToRad(s.zh));

        mvPushMatrix();

        mat4.translate(mvMatrix, [s.lpos.x, s.lpos.y, s.lpos.z]);
        mat4.scale(mvMatrix, [0.1, 0.1, 0.1]);

        drawItem(itemBuffers[sphereIndex]);

        mvPopMatrix();
    }

    setLightUniforms();
}

function setLightUniforms() {
    if (s.doLight) {
        ambient = [0.2, 0.2, 0.2];
        specular = diffuse = [1.0, 1.0, 1.0];
    } else {
        ambient = [1.0, 1.0, 1.0];
        specular = diffuse = [0.0, 0.0, 0.0];
    }

    gl.uniform3fv(shaderProgram.ambientUniform, ambient);
    gl.uniform3fv(shaderProgram.diffuseUniform, diffuse);
    gl.uniform3fv(shaderProgram.specularUniform, specular);
    gl.uniform4fv(shaderProgram.lPosUniform, [s.lpos.x, s.lpos.y, s.lpos.z, 1.0]);
}

function initBuffers() {
    itemBuffers[0] = initCubeBuffers(gl);
    itemBuffers[1] = initPyramidBuffers(gl);
    itemBuffers[2] = initSphereBuffers(gl);
    itemBuffers[3] = initScreenBuffers(gl);
}

function doProjection() {
    mat4.identity(pMatrix);
    var fov = s.fov;
    var asp = s.asp;
    var dim = s.dim;

    if (fov)
        mat4.perspective(fov, asp,dim/4,4*dim, pMatrix);
    else
        mat4.ortho(-dim*asp, +dim*asp, -dim, +dim, -dim, +dim, pMatrix);
}

function doView() {
    mat4.identity(vMatrix);
    if (s.fov) mat4.translate(vMatrix, [0,0,-2*s.dim]);

    mat4.rotate(vMatrix, degToRad(s.th), [1,0,0]);
    mat4.rotate(vMatrix, degToRad(s.ph), [0,1,0]);

    // Set mv matrix equal to view matrix
    mat4.set(vMatrix, mvMatrix);
}

function drawItem(itemBuf) {
    setMatrixUniforms();

    gl.bindBuffer(gl.ARRAY_BUFFER, itemBuf.pos);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, itemBuf.pos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, itemBuf.col);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, itemBuf.col.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, itemBuf.tex);
    gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, itemBuf.tex.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, itemBuf.norm);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, itemBuf.norm.itemSize, gl.FLOAT, false, 0, 0);
    if ('indexData' in itemBuf) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, itemBuf.indexData);
        gl.drawElements(gl.TRIANGLES, itemBuf.indexData.numItems, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, itemBuf.pos.numItems);
    }
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    doProjection();
    doView();

    // Set tex1 and tex2 to use TEXTURE0,1
    gl.uniform1i(shaderProgram.tex1, 0);
    gl.uniform1i(shaderProgram.tex2, 1);

    // Disable textures and lighting when we draw the light
    gl.uniform1f(shaderProgram.noTexture, 1);
    drawLight();
    gl.uniform1f(shaderProgram.noTexture, 0);

    drawItem(itemBuffers[s.itemIndex]);
}

function initElements() {
    // Get the select elements
    var shaderSelect = $('select[name="shader-program"]');
    var texFgSelect = $('select[name="texture-fg"]');
    var texBgSelect = $('select[name="texture-bg"]');

    function changeShader() {
        s.shaderIndex = Number(shaderSelect.val());
        initShaders();
    }

    function fgChange() {
        // Pause the video if it's not the bg video
        if (isVideo(s.fgI) && s.fgI != s.bgI)
            getVideo(s.fgI).pause();

        s.fgI = Number(texFgSelect.val());

        if (isVideo(s.fgI)) {
            s.isVideoFg = true;
            getVideo(s.fgI).play();
        } else {
            s.isVideoFg = false;
        }

        // Set the fg texture to the new texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[s.fgI]);
    }

    function bgChange() {
        // Pause the video if it's not the fg video
        if (isVideo(s.bgI) && s.bgI != s.fgI)
            getVideo(s.bgI).pause();

        s.bgI = Number(texBgSelect.val());

        if (isVideo(s.bgI)) {
            s.isVideoBg = true;
            getVideo(s.bgI).play();
        } else {
            s.isVideoBg = false;
        }

        // Set the bg texture to the new texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[s.bgI]);
    }

    // On change event call...
    shaderSelect.change(changeShader);
    texFgSelect.change(fgChange);
    texBgSelect.change(bgChange);

    // Call funcs to init our vars to the currently selected values
    changeShader();
    fgChange();
    bgChange();

    //  Resize canvas
    canvas.resize = function() {
        var size = Math.min(window.innerWidth, window.innerHeight) - 10;
        canvas.width = canvas.height = size;
        s.asp = 1; // size / size
        gl.viewport(0,0,size,size);
    }

    //  Mouse button pressed
    canvas.onmousedown = function(ev) {
        s.move = 1;
        s.x0 = ev.clientX;
        s.y0 = ev.clientY;
    }

    //  Mouse button released
    canvas.onmouseup = function(ev) {
        s.move = 0;
    }

    //  Mouse movement
    canvas.onmousemove = function(ev) {
        if (s.move == 0) return;
        //  Update angles
        s.ph += ev.clientX-s.x0;
        s.th += ev.clientY-s.y0;
        //  Store location
        s.x0 = ev.clientX;
        s.y0 = ev.clientY;
    }

    // Cleanup
    $(window).on('unload', function() {
        for (var i = 0; i < textures.length; i++)
            gl.deleteTexture(textures[i]);

        for (var i = 0; i < itemBuffers.length; i++) {
            gl.deleteBuffer(itemBuffers[i].pos);
            gl.deleteBuffer(itemBuffers[i].col);
            gl.deleteBuffer(itemBuffers[i].tex);
            gl.deleteBuffer(itemBuffers[i].norm);

            if ('indexData' in itemBuffers[i])
                gl.deleteBuffer(itemBuffers[i].indexData);
        }
    });
}

function handleKeyDown(event) {
    switch (event.keyCode) {
        case 80: // p: project
            s.fov = (s.fov) ? 0 : 55;
            break;
        case 76: // l: do lighting
            s.doLight = !s.doLight;
            break;
        case 37: // left arrow
        case 65: // a: select previous item
            if (--s.itemIndex < 0)
                s.itemIndex = itemBuffers.length - 1;
            break;
        case 39: // right arrow
        case 68: // d: select next item
            s.itemIndex = (s.itemIndex + 1) % itemBuffers.length;
            break;
        case 83: // s: start and stop video
            if (isVideo(s.fgI)) {
                var video = getVideo(s.fgI);
                if (video.paused)
                    video.play();
                else
                    video.pause();
            }
            
            if (isVideo(s.bgI)) {
                var video = getVideo(s.bgI);
                if (video.paused)
                    video.play();
                else
                    video.pause();
            }
            break;
        case 77: // m
            // Movie mode
            if (s.mode) {
                s.mode = 0;

                s.fov = s.old.fov;
                s.doLight = s.old.doLight;
                s.itemIndex = s.old.itemIndex;
                s.th = s.old.th;
                s.ph = s.old.ph;
            } else {
                s.mode = 1;

                s.old.fov = s.fov;
                s.old.itemIndex = s.itemIndex;
                s.old.doLight = s.doLight;
                s.old.th = s.th;
                s.old.ph = s.ph;

                s.fov = 0;
                s.doLight = false;
                s.itemIndex = itemBuffers.length - 1;
                s.th = s.ph = 0;
            }
            break;
    }
}

var then = 0;
function animate(now) {
    now *= 0.001; // Convert to seconds
    var deltaTime = now - then;

    // Update light position
    if (s.doLight) {
        s.zh += deltaTime * 100;
        s.zh %= 360;
    }

    // Update video textures
    if (s.isVideoFg && getVideo(s.fgI).copyVideo) {
        gl.activeTexture(gl.TEXTURE0);
        updateTexture(textures[s.fgI], getVideo(s.fgI));
    }

    if (s.isVideoBg && getVideo(s.bgI).copyVideo) {
        gl.activeTexture(gl.TEXTURE1);
        updateTexture(textures[s.bgI], getVideo(s.bgI));
    }

    then = now;
}

function tick(now) {
    requestAnimationFrame(tick);
    animate(now);
    drawScene();
}

function webGLStart() {
    initGL();
    initShaders();
    initBuffers();
    initTextures();
    initElements();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;

    tick(0);
}