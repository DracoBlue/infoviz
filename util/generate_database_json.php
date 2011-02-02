<?php
$var = '3	C	Ring number	Ring Nr.		PPS
4	AD	Cutter head - torque	Bohrkopfdrehmoment	kNm	Drehmomente der einzelnen Motoren über Getriebeübersetzung
5	AE	Cutter head - speed	Bohrkopfdrehzahl	rpm	Impulse vom Antriebsritzel
6	AF	Cutter head - Angular position	Bohrkopfwinkelposition	°	über Impulse vom Antriebsritzel
7	AG	Cutter head - Direction 0=off 1=cw- 2=ccw	BK Drehrichtung 0=aus 1=CW 2=CWW		Steuerpult
8	AH	Cutter head - power	Bohrkpofantriebsleistung	kW	Aus BK Drehmoment
9	AU	Thrust - advance speed	Vorschubgeschwindigkeit	mm/min	über Wegmessung an Vorschubzylinder
10	AV	Thrust - back-up force	Zugkraft Nachläufer	kN	Zylinder TBM
11	AW	Thrust - Top sector pressure	Vorschubdruck oberer Sektor	bar	Ventile vor Eintritt in Zylinder
12	AX	Thrust - Right sector pressure	Vorschubdruck rechter Sektor in Bohrrichtung	bar	Ventile vor Eintritt in Zylinder
13	AY	Thrust - Bottom sector pressure	Vorschubdruck unterer Sektor	bar	Ventile vor Eintritt in Zylinder
14	AZ	Thrust - Left sector pressure	Vorschubdruck linker Sektor in Bohrrichtung	bar	Ventile vor Eintritt in Zylinder
15	BA	Thrust - Right sector position	Vorschubweg rechter Sektor in Bohrrichtung	mm 	Wegmessung Vorschubzylinder
16	BB	Thrust - Bottom sector position	Vorschubweg unterer Sektor	mm 	Wegmessung Vorschubzylinder
17	BC	Thrust - Left sector position	Vorschubweg linker Sektor in Bohrrichtung	mm 	Wegmessung Vorschubzylinder
18	BD	Thrust - Top sector position	Vorschubweg oberer Sektor	mm 	Wegmessung Vorschubzylinder
19	BE	Penetration	Penetration	mm/U	Wegmessung Vorschubzylinder /Vorschubsgeschw.
20	BF	Thrust Total force	Vorschubkraft total	MN	Summe Einzelkräfte
21	BW	Mortar - Volume all lines	Mörtelvolumen Total	m3	Summe Einzel Volumen
22	BX	Earth pressure 1 shield top	Erddrucksensor 1 Schild oben	bar	Druckwand
23	BY	Earth pressure 2 shield right	Erddrucksensor 2 Schild rechts	bar	Druckwand
24	BZ	Earth pressure 3 shield right bottom	Erddrucksensor 3 Schild rechts unten	bar	Druckwand
25	CA	Earth pressure 4 shield left	Erddrucksensor 4 Schild links	bar	Druckwand
26	CB	Earth pressure 5 shield left bottom	Erddrucksensor 5 Schild links unten	bar	Druckwand
27	CC	Earth pressure 6 screw conv. front	Erddrucksensor 6 Förderschnecke vorne	bar	Vorne im BK-Bereich
28	CD	Earth pressure 7 screw conv. rear	Erddrucksensor 7 Förderschnecke hinten	bar	Hinten im Bereich vor Abförderklappe
29	CE	Screw conveyor pressure	Druck Antrieb Förderschnecke	bar	Am Antrieb 
30	CF	Screw conveyor speed	Drehzahl Förderschnecke	rpm	Ritzel auf Antriebswelle
31	CG	Screw conveyor torque	Drehmoment Förderschnecke	kNm	Berechnung aus Druck 
32	CH	Conv. C2 theoretical weight belt weigher	Bandwaage Förderband C2 theoretisch 	t	Förderband C2
33	CI	Conv. C2 actual weight belt weigher	Bandwaage Förderband C2 effektiv	t	Förderband C2
34	CJ	Conv. C2 belt weigher weight eff./theo.	Bandwaage Förderband C2 Eff./Theo.		Berechnung aus CH & CI
35	CT	Conv. C2 theo. weight volume scanner	Volumenscanner Förderband C2 theoretisch 	t	Förderband C2
36	CU	Conv. C2 actual weight volume scanner	Volumenscanner Förderband C2 effektiv	t	Förderband C2
37	CV	Conv. C2 volume scanner weight eff./the.	Volumenscanner Förderband C2 Eff./Theo.		Berechnung aus CH & CI
38	CW	Pitching	Neigung	Grad	PPS
39	CX	Rolling	Verrollung	Grad	PPS
40	DA	Foam Mode (Off=0, Man=1, Auto=2)	Schaum manuell / automatisch		Wahlschalter Kabine
41	DB	Thrust - Top sector force	Vorschubkraft oberer Sektor	kN	Berechnung aus Druck
42	DC	Thrust - Right sector force	Vorschubkraft rechter Sektor in Bohrrichtung	kN	Berechnung aus Druck
43	DD	Thrust - Bottom sector force	Vorschubkraft unterer Sektor	kN	Berechnung aus Druck
44	DE	Thrust - Left sector force	Vorschubkraft linker Sektor in Bohrrichtung	kN	Berechnung aus Druck
45	DU	Conv. C2 weight belt weigher density	Bandwaage Förderband C2 spezifisches Gewicht	t/m³	Vorwahl auf Bedienpult
46	DV	Conv. C2 weight volume scanner density	Bandwaage Förderband C2 spezifisches Gewicht	t/m³	Vorwahl auf Bedienpult';

$database = array();

foreach (explode("\n", $var) as $line)
{
	list($id, $name, $english_caption, $german_caption) = explode("\t", $line);
    $database[] = array('id' => $id, 'name' => $name, 'caption' => $german_caption);
}

echo json_encode($database);
