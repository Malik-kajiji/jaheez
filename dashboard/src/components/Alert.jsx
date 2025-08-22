import { useDispatch,useSelector } from 'react-redux';
import { BiErrorCircle } from 'react-icons/bi';
import { VscError,VscPass } from 'react-icons/vsc';
import { alertActions } from '../redux/AlertController';



const Alert = () => {
    const alert = useSelector((state)=> state.alertController);
    const dispatch = useDispatch();

    if(alert.showen === true){
        setTimeout(() => {
            dispatch(alertActions.hideAlert({}))
        }, 5000);
    }

    return (
        <article className={`alert ${alert.type} ${alert.showen?'showen' :''}`}>
            <p className='TXT-normal'>{alert.msg}</p>
            {alert.type === 'error'? <span className='TXT-heading3'>{VscError({})}</span>:''}
            {alert.type === 'warrning'? <span className='TXT-heading3'>{BiErrorCircle({})}</span>:''}
            {alert.type === 'success'? <span className='TXT-heading3'>{VscPass({})}</span>:''}
        </article>
    )
}

export default Alert