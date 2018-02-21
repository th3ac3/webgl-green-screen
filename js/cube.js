function initCubeBuffers(gl) {
    var cubeBuffers = {};

    // Cube vertex positions
    cubeBuffers.pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.pos);
    var xyz = [
        -1,-1, 1, +1,-1, 1, -1,+1, 1,     -1,+1, 1, +1,-1, 1, +1,+1, 1,
        +1,-1,-1, -1,-1,-1, +1,+1,-1,     +1,+1,-1, -1,-1,-1, -1,+1,-1,
        +1,-1,+1, +1,-1,-1, +1,+1,+1,     +1,+1,+1, +1,-1,-1, +1,+1,-1,
        -1,-1,-1, -1,-1,+1, -1,+1,-1,     -1,+1,-1, -1,-1,+1, -1,+1,+1,
        -1,+1,+1, +1,+1,+1, -1,+1,-1,     -1,+1,-1, +1,+1,+1, +1,+1,-1,
        -1,-1,-1, +1,-1,-1, -1,-1,+1,     -1,-1,+1, +1,-1,-1, +1,-1,+1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(xyz), gl.STATIC_DRAW);
    cubeBuffers.pos.itemSize = 3;
    cubeBuffers.pos.numItems = 36;

    //  Cube colors
    cubeBuffers.col = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.col);
    var rgb = [
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rgb), gl.STATIC_DRAW);
    cubeBuffers.col.itemSize = 3;
    cubeBuffers.col.numItems = 36;

    // Cube textures
    cubeBuffers.tex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.tex);
    var tex = [
        0,0, 1,0, 0,1,  0,1, 1,0, 1,1,
        0,0, 1,0, 0,1,  0,1, 1,0, 1,1,
        0,0, 1,0, 0,1,  0,1, 1,0, 1,1,
        0,0, 1,0, 0,1,  0,1, 1,0, 1,1,
        0,0, 0,1, 1,0,  1,0, 0,1, 1,1,
        0,0, 0,1, 1,0,  1,0, 0,1, 1,1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex), gl.STATIC_DRAW);
    cubeBuffers.tex.itemSize = 2;
    cubeBuffers.tex.numItems = 36;

    // Cube normals
    cubeBuffers.norm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.norm);
    var normals = [
        0,0, 1, 0,0, 1, 0,0, 1,  0,0, 1, 0,0, 1, 0,0, 1,
        0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1,
         1,0,0,  1,0,0,  1,0,0,   1,0,0,  1,0,0,  1,0,0,
        -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0,
        0, 1,0, 0, 1,0, 0, 1,0,  0, 1,0, 0, 1,0, 0, 1,0,
        0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    cubeBuffers.norm.itemSize = 3;
    cubeBuffers.norm.numItems = 36;

    return cubeBuffers;
}