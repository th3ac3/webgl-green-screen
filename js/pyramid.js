function initPyramidBuffers(gl) {
    var pyramidBuffers = {};

    // Pyramid vertex positions
    pyramidBuffers.pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidBuffers.pos);
    var xyz = [
        // Front
        0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        // Right
        0.0,  1.0,  0.0,
        1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,
        // Back
        0.0,  1.0,  0.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        // Left
        0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        // Bottom
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(xyz), gl.STATIC_DRAW);
    pyramidBuffers.pos.itemSize = 3;
    pyramidBuffers.pos.numItems = 18;

    //  Pyramid colors
    pyramidBuffers.col = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidBuffers.col);
    var rgb = [
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
        1,1,1, 1,1,1, 1,1,1,     1,1,1, 1,1,1, 1,1,1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rgb), gl.STATIC_DRAW);
    pyramidBuffers.col.itemSize = 3;
    pyramidBuffers.col.numItems = 18;

    // Pyramid textures
    pyramidBuffers.tex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidBuffers.tex);
    var tex = [
        0.5,0.5, 0,0, 1,0,  
        0.5,0.5, 1,0, 1,1,
        0.5,0.5, 1,1, 0,1,  
        0.5,0.5, 0,1, 0,0,
          0,0, 0,1, 1,0,
          1,1, 1,0, 0,1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex), gl.STATIC_DRAW);
    pyramidBuffers.tex.itemSize = 2;
    pyramidBuffers.tex.numItems = 18;

    // Pyramid normals
    pyramidBuffers.norm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidBuffers.norm);
    var normals = [
        0,1,1, 0,1,1, 0,1,1,
        1,1,0, 1,1,0, 1,1,0,
        0,1,-1, 0,1,-1, 0,1,-1,
        -1,1,0, -1,1,0, -1,1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    pyramidBuffers.norm.itemSize = 3;
    pyramidBuffers.norm.numItems = 18;

    return pyramidBuffers;
}