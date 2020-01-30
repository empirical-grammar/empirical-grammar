import 'lazysizes';
import 'lazysizes/plugins/parent-fit/ls.parent-fit';
import ReactOnRails from 'react-on-rails';
import 'antd/dist/antd.css';

import '../styles/styles.scss';
import ConceptsIndex from './ConceptsIndex.tsx';
import BackpackIndex from '../containers/BackpackIndex.tsx'

ReactOnRails.register({ ConceptsIndex, BackpackIndex, });
