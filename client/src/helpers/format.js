export const formatCurrency = (value) => {
	return value
		? value.toLocaleString('vi', { style: 'currency', currency: 'VND' })
		: '0';
};
