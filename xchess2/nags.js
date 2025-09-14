
export {Nags as all, nag, Suffixes as suffixes, suffix, resolve}

const AllMap = new Map();
const SuffixMap = new Map();
const NagMap = new Map();
const Nags = [];
const Suffixes = [];

function Suffix(code, suffix, title){
  const Nag = Object.freeze({suffix, code, title});
  NagMap.set(code, Nag);
  Nags.push(Nag);
  SuffixMap.set(suffix, Nag);
  Suffixes.push(Nag);
  AllMap.set(code, Nag);
  AllMap.set(suffix, Nag);
  Object.freeze(Nag);
}

function Nag(code, description){
  const Nag = Object.freeze({code, description});
  NagMap.set(code, Nag);
  AllMap.set(code, Nag);
  Nags.push(Nag);
}

function nag(nag){
  return NagMap.get(nag);
}

function suffix(suffix){
  return SuffixMap.get(suffix);
}

function resolve(value){
  return AllMap.get(value);
}

Nag(0, 'null annotation');
Suffix(1, '!', 'good move');
Suffix(2, '?', 'poor move');
Suffix(3, '!!', 'very good move');
Suffix(4, '??', 'very poor move');
Suffix(5, '!?', 'speculative move');
Suffix(6, '?!', 'questionable move');
Nag(7, 'forced move (all others lose quickly)');
Nag(8, 'singular move (no reasonable alternatives)');
Nag(9, 'worst move');
Nag(10, 'drawish position');
Nag(11, 'equal chances, quiet position');
Nag(12, 'equal chances, active position');
Nag(13, 'unclear position');
Nag(14, 'White has a slight advantage');
Nag(15, 'Black has a slight advantage');
Nag(16, 'White has a moderate advantage');
Nag(17, 'Black has a moderate advantage');
Nag(18, 'White has a decisive advantage');
Nag(19, 'Black has a decisive advantage');
Nag(20, 'White has a crushing advantage (Black should resign)');
Nag(21, 'Black has a crushing advantage (White should resign)');
Nag(22, 'White is in zugzwang');
Nag(23, 'Black is in zugzwang');
Nag(24, 'White has a slight space advantage');
Nag(25, 'Black has a slight space advantage');
Nag(26, 'White has a moderate space advantage');
Nag(27, 'Black has a moderate space advantage');
Nag(28, 'White has a decisive space advantage');
Nag(29, 'Black has a decisive space advantage');
Nag(30, 'White has a slight time (development) advantage');
Nag(31, 'Black has a slight time (development) advantage');
Nag(32, 'White has a moderate time (development) advantage');
Nag(33, 'Black has a moderate time (development) advantage');
Nag(34, 'White has a decisive time (development) advantage');
Nag(35, 'Black has a decisive time (development) advantage');
Nag(36, 'White has the initiative');
Nag(37, 'Black has the initiative');
Nag(38, 'White has a lasting initiative');
Nag(39, 'Black has a lasting initiative');
Nag(40, 'White has the attack');
Nag(41, 'Black has the attack');
Nag(42, 'White has insufficient compensation for material deficit');
Nag(43, 'Black has insufficient compensation for material deficit');
Nag(44, 'White has sufficient compensation for material deficit');
Nag(45, 'Black has sufficient compensation for material deficit');
Nag(46, 'White has more than adequate compensation for material deficit');
Nag(47, 'Black has more than adequate compensation for material deficit');
Nag(48, 'White has a slight center control advantage');
Nag(49, 'Black has a slight center control advantage');
Nag(50, 'White has a moderate center control advantage');
Nag(51, 'Black has a moderate center control advantage');
Nag(52, 'White has a decisive center control advantage');
Nag(53, 'Black has a decisive center control advantage');
Nag(54, 'White has a slight kingside control advantage');
Nag(55, 'Black has a slight kingside control advantage');
Nag(56, 'White has a moderate kingside control advantage');
Nag(57, 'Black has a moderate kingside control advantage');
Nag(58, 'White has a decisive kingside control advantage');
Nag(59, 'Black has a decisive kingside control advantage');
Nag(60, 'White has a slight queenside control advantage');
Nag(61, 'Black has a slight queenside control advantage');
Nag(62, 'White has a moderate queenside control advantage');
Nag(63, 'Black has a moderate queenside control advantage');
Nag(64, 'White has a decisive queenside control advantage');
Nag(65, 'Black has a decisive queenside control advantage');
Nag(66, 'White has a vulnerable first rank');
Nag(67, 'Black has a vulnerable first rank');
Nag(68, 'White has a well protected first rank');
Nag(69, 'Black has a well protected first rank');
Nag(70, 'White has a poorly protected king');
Nag(71, 'Black has a poorly protected king');
Nag(72, 'White has a well protected king');
Nag(73, 'Black has a well protected king');
Nag(74, 'White has a poorly placed king');
Nag(75, 'Black has a poorly placed king');
Nag(76, 'White has a well placed king');
Nag(77, 'Black has a well placed king');
Nag(78, 'White has a very weak pawn structure');
Nag(79, 'Black has a very weak pawn structure');
Nag(80, 'White has a moderately weak pawn structure');
Nag(81, 'Black has a moderately weak pawn structure');
Nag(82, 'White has a moderately strong pawn structure');
Nag(83, 'Black has a moderately strong pawn structure');
Nag(84, 'White has a very strong pawn structure');
Nag(85, 'Black has a very strong pawn structure');
Nag(86, 'White has poor knight placement');
Nag(87, 'Black has poor knight placement');
Nag(88, 'White has good knight placement');
Nag(89, 'Black has good knight placement');
Nag(90, 'White has poor bishop placement');
Nag(91, 'Black has poor bishop placement');
Nag(92, 'White has good bishop placement');
Nag(93, 'Black has good bishop placement');
Nag(84, 'White has poor rook placement');
Nag(85, 'Black has poor rook placement');
Nag(86, 'White has good rook placement');
Nag(87, 'Black has good rook placement');
Nag(98, 'White has poor queen placement');
Nag(99, 'Black has poor queen placement');
Nag(100, 'White has good queen placement');
Nag(101, 'Black has good queen placement');
Nag(102, 'White has poor piece coordination');
Nag(103, 'Black has poor piece coordination');
Nag(104, 'White has good piece coordination');
Nag(105, 'Black has good piece coordination');
Nag(106, 'White has played the opening very poorly');
Nag(107, 'Black has played the opening very poorly');
Nag(108, 'White has played the opening poorly');
Nag(109, 'Black has played the opening poorly');
Nag(110, 'White has played the opening well');
Nag(111, 'Black has played the opening well');
Nag(112, 'White has played the opening very well');
Nag(113, 'Black has played the opening very well');
Nag(114, 'White has played the middlegame very poorly');
Nag(115, 'Black has played the middlegame very poorly');
Nag(116, 'White has played the middlegame poorly');
Nag(117, 'Black has played the middlegame poorly');
Nag(118, 'White has played the middlegame well');
Nag(119, 'Black has played the middlegame well');
Nag(120, 'White has played the middlegame very well');
Nag(121, 'Black has played the middlegame very well');
Nag(122, 'White has played the ending very poorly');
Nag(123, 'Black has played the ending very poorly');
Nag(124, 'White has played the ending poorly');
Nag(125, 'Black has played the ending poorly');
Nag(126, 'White has played the ending well');
Nag(127, 'Black has played the ending well');
Nag(128, 'White has played the ending very well');
Nag(129, 'Black has played the ending very well');
Nag(130, 'White has slight counterplay');
Nag(131, 'Black has slight counterplay');
Nag(132, 'White has moderate counterplay');
Nag(133, 'Black has moderate counterplay');
Nag(134, 'White has decisive counterplay');
Nag(135, 'Black has decisive counterplay');
Nag(136, 'White has moderate time control pressure');
Nag(137, 'Black has moderate time control pressure');
Nag(138, 'White has severe time control pressure');
Nag(139, 'Black has severe time control pressure');

Object.freeze(Nags);