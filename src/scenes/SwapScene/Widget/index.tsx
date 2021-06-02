import { Button } from '../../../components/Button';
import { TextInput } from '../../../components/TextInput';

export const Widget = () => {
  return (
    <div>
      <div>from</div>
      <TextInput size="state" value="" />
      <div>top</div>
      <Button variant="primary" size="state">
        swap
      </Button>
      <div>details</div>
    </div>
  );
};
