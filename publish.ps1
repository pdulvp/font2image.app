$foo = (Get-Content "publish-config.json" | Out-String | ConvertFrom-Json)

$user = $foo.user
$domain = $foo.domain
$password = $foo.password
$ftpUrl = $foo.ftpUrl
$credentials = "$user"+":"+"$password"
$cacheFile = "publish-cache.json"
$ignoreFile = ".publishignore"

$extensions = ".html"
$date = Get-Date -Format "yyyy-MM-ddThh:mmK"

function Relative {
	process {
		$name = $_ | Resolve-Path -Relative
		if ($name[0] -eq '.' -And $name[1] -eq '\') {
			$name=$name.ToString().Substring(2);
		}
		return $name;
	}
}

function CreateSiteMap {
    begin {
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    }
    process {
		$name = $_ | Relative
        if ($extensions -contains $_.extension)
        {
        "  <url>"
        "    <loc>$domain/$name</loc>"
        "    <lastmod>{0:s}Z</lastmod>" -f $date
        "  </url>"
        }
    }
    end {
        "</urlset>"
    }
}

function LoadCache {
	process {
		if (! (Test-Path $cacheFile -PathType leaf))
		{
			@{} | ConvertTo-Json | Set-Content $cacheFile
		}
		$json = (Get-Content $cacheFile | Out-String | ConvertFrom-Json)
		$result = @{}
		$json.psobject.properties | Foreach { $result[$_.Name] = $_.Value }
		return $result
	}
}

function SaveCache {
	process {
		$_ | ConvertTo-Json | Set-Content $cacheFile
	}
}

$filePath = Get-ChildItem -Recurse . | Where { ! $_.PSIsContainer }
$filePath | CreateSiteMap | out-file -encoding UTF-8 sitemap.xml

$md5values = LoadCache

ForEach($i in $filePath) {
	$name = $i | Relative
	$dir = $i.Directory | Resolve-Path -Relative | Relative
	if ($dir[0] -eq '.' -And $dir[1] -eq '.') {
		$dir=""
	} else {
		$dir = $dir + "/"
	}
	$dir = $dir.replace("\","/")
	$name = $name.replace("\","/")
	
	If(! (Get-Content $ignoreFile).Contains($name)) {
		$add = $FALSE
		$md5 = Get-FileHash $name -Algorithm MD5
		if (! ($md5values.ContainsKey($name))) {
			$md5values += @{$name = $md5.Hash}
			$add = $TRUE;
		} elseif (! ($md5values[$name] -eq $md5.Hash)) {
			$md5values[$name] = $md5.Hash
			$add = $TRUE;
		} elseif ($extensions -contains $i.extension) {
			$add = $TRUE;
		}
		if ($add) {
			Write-Host $name
			curl -s -u $credentials --create-dirs --ftp-create-dirs -T "$name" "$ftpUrl/$dir"
		}
	}
}

$md5values | SaveCache