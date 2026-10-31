# Design
develop(t) in [0,1] maps elapsed fraction to exposure: monotonic, develop(0)=0, develop(1)=1.
Per pixel: out = paper + (img - paper) * develop(t), with slight grain and contrast curve.
Stop bath freezes t. Rendering via requestAnimationFrame on one canvas.
