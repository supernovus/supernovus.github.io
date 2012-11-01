#!/usr/bin/env perl6

use v6;
use Template6;
use JSON::Tiny;

print "Preparing data... ";

my $t6 = Template6.new;
$t6.add-path: './src';

my $config = from-json(slurp('./src/config.json'));

my $statuses = $config<statuses>;
my $projects = $config<projects>;

my $stat = {};
for @($statuses) -> $status 
{
  my $sid = $status<id>;
  $status<items> = [];
  $stat{$sid} = $status;
}

my @pkeys = 
  $projects.keys.sort({ $projects{$^a}<name>.lc cmp $projects{$^b}<name>.lc });

for @pkeys -> $pid 
{
  my $project = $projects{$pid};
  if (!$project.exists('src')) 
  {
    $project<src> = $pid;
  }
  if (!$project.exists('local'))
  {
    $project<local> = False;
  }
  my $is = $project<is>;
  $stat{$is}<items>.push: $project;
}

say "done.";

print "Building page... ";

my $updated = $config<updated>;
my $tocpage = $t6.process('index', :$updated, :$statuses);

my $output = open 'index.html', :w;
$output.print: $tocpage;
$output.close;

say "done.";

