import {Router} from 'express';

const router=Router();

router.get('/a',(req,res)=>{
    res.send("chodu");
});

export default router;