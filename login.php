<?php

$dbhost = '198.154.219.152';	// Change to localhost on production server
$dbuser = 'scremote';
$dbpass = 'elephant2banana';
$dbname = 'superspace';

session_start();

$status = '';

if (isset($_SESSION['username'])) {
	header('Location: /');
	exit();
} else if (isset($_POST['username'])) {
	try {
		$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
		$dbh->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
		$sth = $dbh->prepare('select username from sc_users where username=:u and password=password(:p)');
		//$sth = $dbh->prepare('select username from sc_users where username=:u');
		$sth->bindParam(':u', $_POST['username'], PDO::PARAM_STR);
		$sth->bindParam(':p', $_POST['password'], PDO::PARAM_STR);
		$sth->execute();
		$r = $sth->fetch(PDO::FETCH_ASSOC);
		if (isset($r['username'])) {
			$_SESSION['username'] = $r['username'];
			header('Location: /');
			exit();
		} else {
			$status = 'Bad username or password';
		}
	} catch (PDOException $e) {
		$status = $e->getMessage();
	}
}
?>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta http-equiv="X-UA-Compatible" content="IE=9" >
	<title>STARCODER</title>

	<!-- STYLES -->
	<link href="css/default.css" rel="stylesheet" type="text/css" />
</head>
<body>


<div id="login"><form method="post" action="login.php">
	<div class="loginTitle">Login / register</div>
	<div class="loginField">Username: <input type="text" name="username" class="right"></div>
	<div class="loginField">Password: <input type="password" name="password" class="right"></div>
	<div class="loginField">Remember me <input type="checkbox" name="remember">
	<button type="submit" name="submit" class="right">Login/register</button></div>
	<div class="loginStatus"><?php echo $status; ?></div>
<form></div>

</body>
</html>