import React, { useEffect, useRef, useState } from 'react';
import { Footer } from '../../components/Footer/Footer';
import { Header } from '../../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	solid,
	regular,
	brands,
	icon,
} from '@fortawesome/fontawesome-svg-core/import.macro';
import './Checkout.scss';
import { Link } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import { formatCurrency } from '../../helpers/format';
import { getTotalCart } from '../../helpers/cartHelper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Checkout = () => {
	const PF = process.env.REACT_APP_PUBLIC_FOLDER;

	const [cart, setCart] = useState([]);

	const [provinceList, setProvinceList] = useState([]);
	const [districList, setDistrictList] = useState([]);
	const [wardList, setWardList] = useState([]);
	const [province, setProvince] = useState('');
	const [district, setDistrict] = useState('');
	const [ward, setWard] = useState('');
	const email = useRef('');
	const firstName = useRef('');
	const lastName = useRef('');
	const telephone = useRef('');
	const address = useRef('');
	const [isSuccess, setIsSuccess] = useState(true);
	const [payment, setPayment] = useState('cashdelivery');

	const shipFee = getTotalCart() > 200000 ? 0 : 20000;

	useEffect(() => {
		setCart(JSON.parse(localStorage.getItem('cart')));
	}, []);

	useEffect(() => {
		const getProvinceAPI = async () => {
			try {
				const res = await axios.get(
					'https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1'
				);
				const arrProvince = res.data.data.data.map((item) => ({
					name: item.name,
					pcode: item.code,
				}));
				setProvinceList(arrProvince);
			} catch (err) {
				console.log(err);
			}
		};
		getProvinceAPI();
	}, []);

	useEffect(() => {
		const getDistrictAPI = async () => {
			if (province) {
				try {
					const res = await axios.get(
						`https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${province.pcode}&limit=-1`
					);
					const arrDistrict = res.data.data.data.map((item) => ({
						name: item.name,
						dcode: item.code,
					}));
					setDistrictList(arrDistrict);
					setDistrict(arrDistrict[0]);
				} catch (err) {
					console.log(err);
				}
			}
		};
		getDistrictAPI();
	}, [province]);

	useEffect(() => {
		const getDistrictAPI = async () => {
			if (district) {
				try {
					const res = await axios.get(
						`https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${district.dcode}&limit=-1`
					);
					const arrWard = res.data.data.data.map((item) => ({
						name: item.name,
						wcode: item.code,
					}));
					setWardList(arrWard);
					setWard(arrWard[0]);
				} catch (err) {
					console.log(err);
				}
			}
		};
		getDistrictAPI();
	}, [district]);

	const handleSubmitOrder = async () => {
		const cartList = cart.map((c) => ({
			productId: c.productId,
			quantity: c.quantity,
			variations: c.variations,
		}));
		const orderInfo = {
			email: email.current.value,
			firstName: firstName.current.value,
			lastName: lastName.current.value,
			telephone: telephone.current.value,
			address: address.current.value,
			province: province.name,
			district: district.name,
			ward: ward.name,
			payment: payment,
			value: getTotalCart() + shipFee,
		};

		const checkInfoEmpty = Object.values(orderInfo).some(
			(x) => x === null || x === ''
		);

		if (checkInfoEmpty || _.isEmpty(cart)) {
			setIsSuccess(false);
		} else {
			setIsSuccess(true);

			const res = await axios.post('/order/', {
				...orderInfo,
				cart: cartList,
			});

			if (res.status === 200) {
				toast.success(
					'B???n ???? ?????t h??ng th??nh c??ng. Trang s??? ???????c chuy???n sau 5 gi??y'
				);
				localStorage.setItem('cart', '[]');
				setTimeout(() => {
					window.location.href = '/';
				}, 5000);
			} else {
				toast.error('L???i !. Vui l??ng th??? l???i.');
			}
		}
	};

	return (
		<>
			<Header />
			<div
				className='slider'
				style={{
					backgroundImage: `url(${PF + 'soap-slider-1.jpg'})`,
				}}>
				<div className='text-block'>
					<h3>Thanh to??n</h3>
					<nav>
						<Link to='/'>Home</Link>
						<FontAwesomeIcon
							icon={solid('chevron-right')}
							className='icon'
						/>
						<Link to={'/cart'}>Gi??? h??ng</Link>
						<FontAwesomeIcon
							icon={solid('chevron-right')}
							className='icon'
						/>
						<span>Thanh to??n</span>
					</nav>
				</div>
			</div>

			<div className='checkout-wrapper'>
				<div className='review'>
					<h1 className='heading'>1. ????n h??ng c???a b???n</h1>
					<div className='cart'>
						{cart &&
							cart.length > 0 &&
							cart.map((item, index) => (
								<div className='product' key={index}>
									<div className='info'>
										<div className='name'>
											{item.productName}
										</div>
										<div className='variations'>
											{item.variations &&
												!_.isEmpty(item.variations) &&
												Object.keys(
													item.variations
												).map((v, index) => (
													<div key={index}>
														<span className='label'>
															{v}
														</span>
														:{' '}
														<span>
															{item.variations[v]}
														</span>
														{index !==
														Object.keys(
															item.variations
														).length -
															1
															? ' , '
															: ''}
													</div>
												))}
										</div>
									</div>
									<div className='quantity'>
										SL: <span>{item.quantity}</span>
									</div>
									<div className='total'>
										{formatCurrency(
											item.quantity * item.productPrice
										)}
									</div>
								</div>
							))}
					</div>
					<div className='delivery-price'>
						<span>Ph?? v???n chuy???n: </span>
						<span>
							{shipFee > 0 ? formatCurrency(shipFee) : 'Mi???n ph??'}
						</span>
					</div>
					<div className='subtotal'>
						<span className='label'>T???ng ????n h??ng :</span>
						<span className='value'>
							{formatCurrency(getTotalCart() + shipFee)}
						</span>
					</div>
					<div className='return-shop'>
						<div className='info'>
							* ????n h??ng tr??n 200.000?? ???????c mi???n ph?? giao h??ng
						</div>
						<Link className='cart' to='/cart'>
							Quay l???i gi??? h??ng
						</Link>
					</div>
				</div>
				<div className='delivery'>
					<h1 className='heading'>2. Th??ng tin giao h??ng</h1>
					<div className='form'>
						<div className='form-group-half'>
							<div className='form-input'>
								<div className='label'>
									H???:
									<span className='required'>*</span>
								</div>
								<input
									type='text'
									name=''
									ref={firstName}
									className='input'
								/>
							</div>

							<div className='form-input'>
								<div className='label'>
									T??n:
									<span className='required'>*</span>
								</div>
								<input
									type='text'
									name=''
									ref={lastName}
									className='input'
								/>
							</div>
						</div>
						<div className='form-group-full'>
							<div className='form-input'>
								<div className='label'>
									Email :<span className='required'>*</span>
								</div>
								<input
									type='text'
									name=''
									ref={email}
									className='input'
								/>
							</div>
						</div>
						<div className='form-group-full'>
							<div className='form-input'>
								<div className='label'>
									S??? ??i???n tho???i
									<span className='required'>*</span>
								</div>
								<input
									type='text'
									name=''
									ref={telephone}
									className='input'
								/>
							</div>
						</div>
						<div className='form-group-half'>
							<div className='form-input'>
								<div className='label'>
									T???nh, Th??nh ph???
									<span className='required'>*</span>
								</div>
								<select
									name='province'
									defaultValue={''}
									className='input'
									id=''
									onChange={(e) =>
										setProvince(JSON.parse(e.target.value))
									}>
									<option value='' disabled>
										- Ch???n T???nh / Th??nh ph??? -
									</option>
									{provinceList &&
										provinceList.length > 0 &&
										provinceList.map((item, index) => (
											<option
												key={index}
												value={JSON.stringify(item)}>
												{item.name}
											</option>
										))}
								</select>
							</div>
							<div className='form-input'>
								<div className='label'>
									Qu???n, Huy???n
									<span className='required'>*</span>
								</div>
								<select
									name='district'
									id=''
									className='input'
									defaultValue={''}
									onChange={(e) =>
										setDistrict(JSON.parse(e.target.value))
									}>
									{districList && districList.length > 0 ? (
										districList.map((item, index) => (
											<option
												key={index}
												value={JSON.stringify(item)}>
												{item.name}
											</option>
										))
									) : (
										<option disabled value={''}>
											--- Ch???n Qu???n / Huy???n ---
										</option>
									)}
								</select>
							</div>
						</div>
						<div className='form-group-half'>
							<div className='form-input'>
								<div className='label'>
									Ph?????ng, x??, th??? tr???n
									<span className='required'>*</span>
								</div>
								<select
									name='ward'
									id=''
									className='input'
									defaultValue={''}
									onChange={(e) =>
										setWard(JSON.parse(e.target.value))
									}>
									{wardList && wardList.length > 0 ? (
										wardList.map((item, index) => (
											<option
												key={index}
												value={JSON.stringify(item)}>
												{item.name}
											</option>
										))
									) : (
										<option disabled value={''}>
											-- Ch???n Ph?????ng / X?? --
										</option>
									)}
								</select>
							</div>
						</div>
						<div className='form-input'>
							<div className='label'>
								S??? nh??, t??n ???????ng
								<span className='required'>*</span>
							</div>
							<input
								type='text'
								placeholder='e.g 123, ???????ng abc'
								name=''
								className='input'
								ref={address}
							/>
						</div>
					</div>
				</div>
				<div className='payment'>
					<h1 className='heading'>3. Ph????ng th???c thanh to??n</h1>
					<div className='payment-method'>
						<div className='payment-item'>
							<input
								type='radio'
								name='payment'
								id='cash'
								defaultChecked
								onChange={(e) => setPayment(e.target.value)}
								value='cashdelivery'
							/>
							<label htmlFor='cash'>
								<FontAwesomeIcon
									icon={solid('money-bill')}
									className='icon'
								/>
								Thanh to??n khi nh???n h??ng
							</label>
						</div>
						<div className='payment-item'>
							<input
								type='radio'
								name='payment'
								id='card'
								value='card'
								onChange={(e) => setPayment(e.target.value)}
							/>
							<label htmlFor='card'>
								<FontAwesomeIcon
									icon={regular('credit-card')}
									className='icon'
								/>{' '}
								Th??? t??n d???ng / Th??? ghi n???
							</label>
						</div>
						<div className='payment-item'>
							<input
								type='radio'
								name='payment'
								id='momo'
								value='momo'
								onChange={(e) => setPayment(e.target.value)}
							/>
							<label htmlFor='momo' className='label-img'>
								<img
									className='icon icon-img'
									src={PF + 'momo-icon.png'}
									alt=''
								/>
								Momo
							</label>
						</div>
						<div className='payment-item'>
							<input
								type='radio'
								name='payment'
								id='zalo'
								value='zalo'
								onChange={(e) => setPayment(e.target.value)}
							/>
							<label htmlFor='zalo' className='label-img'>
								<img
									className='icon icon-img'
									src={PF + 'zalo-icon.png'}
									alt=''
								/>
								Zalo Pay
							</label>
						</div>
					</div>

					<div className='checkout-btn'>
						<button
							className='btn'
							onClick={() => handleSubmitOrder()}>
							Thanh to??n
						</button>
						<ToastContainer
							position='top-right'
							autoClose={5000}
							hideProgressBar={false}
							newestOnTop={false}
							closeOnClick
							rtl={false}
							pauseOnFocusLoss
							draggable
							pauseOnHover
							theme='colored'
						/>
						<p>
							{!isSuccess && (
								<span>
									(*) Vui l??ng ??i???n ?????y ????? th??ng tin giao h??ng
									!
								</span>
							)}
						</p>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
};
